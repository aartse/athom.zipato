'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

// https://www.zipato.com/product/mini-keypad-rfid
// https://file.m.nu/pdf/wt-rfid-eu_zipato.pdf

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		//this.enableDebug();
		//this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register user_code_report capabilty for adding new tags
		this.registerCapability('user_code_report', 'USER_CODE', {
			report: 'USER_CODE_REPORT',
			reportParser: report => {

				// Get user or tag code
				var userCode = report.USER_CODE.toString('hex');
				this.userUnknownTrigger.trigger(this, {deviceId: this.getData().token, userCode: userCode}, {}, (err, result) => {
					if (err) {
						this.log(err);
						return this.homey.error(err);
					}
				});

				// Check if tags can be added
				if (!this.canAddNewTags()) {
					this.addLog(null, this.getData().token, null, 4, null);
					return null;
				}

				// Add new tag
				var tag = this.addTag(userCode);

				// Send new tag id back to tagreader
				this.node.CommandClass.COMMAND_CLASS_USER_CODE.USER_CODE_SET({
						'User Identifier': tag.id,
						'User ID Status': Buffer.from('01', 'hex'),
						USER_CODE: Buffer.from(tag.userCode, 'hex'),
					},
					(err, result) => {
						if (err) {
							return console.error(err);
						}
					}
				);

				// Log new tag
				this.addLog(null, this.getData().token, tag.id, 2, null, null);
				return null;
			}
		});

		// register the alarm_tamper capability with COMMAND_CLASS_ALARM
		// when system is unarmed, set tamper alarm to off
		this.registerCapability('alarm_tamper', 'ALARM', {
			report: 'ALARM_REPORT',
			reportParser: report => {
				switch (report['ZWave Alarm Event']) {
					case 3: // Tamper
						return (report['ZWave Alarm Status'] == 'On');
					case 6: // Home
						return false;
				}
				return null
			}
		});

		// register the alarm_tamper capability with COMMAND_CLASS_ALARM
		this.registerCapability('homealarm_state', 'ALARM', {
			// need a set option, otherwise homey throws an error "Missing Capability Listener" when changing the homealarm_state
			set: 'ALARM_SET',
			setParser: value => {
				// this device has no set command class, so return null.
				// homey will log a warning, but the homealarm_state can be changed
				return null;
			},
			report: 'ALARM_REPORT',
			reportParser: report => {

				//check if Event Parameter is known
				if (typeof report['Event Parameter'] === 'undefined' || report['Event Parameter'] === null) {
					return null;
				}

				// Only handle events 5 (away) or 6 (home)
				var alarmState = null;
				switch (report['ZWave Alarm Event']) {
					case 5: alarmState = 'away'; break;
					case 6: alarmState = 'home'; break;
					default: return null;
				}

				// Search for tag
				var tag = this.getTagById(parseInt(report['Event Parameter'].toString('hex'), 16));
				if (tag === null) {
					// Check if tags can be added
					if (!this.canAddNewTags()) {
						this.addLog(null, this.getData().token, null, 4, null);
						return null;
					}

					// Add tag when tag was previously removed
					tag = this.addTag('(From device)', parseInt(report['Event Parameter'].toString('hex'), 16));
				}

				// Get all users linked to this tag
				var users = this.getUsersByTagId(tag.id);

				// Send trigger for tag when no users are linked to this tag
				if (users.length > 0) {

					// Update all user states
					this.updateUsersState(users, alarmState);

					// Send triggers for every user linked to this tag
					for(var i=0; i<users.length; i++) {
						this.triggerStateChange(alarmState, this.getData().token, tag, users[i]);
					}
				} else {
					this.triggerStateChange(alarmState, this.getData().token, tag, null);
				}

				return (alarmState == 'away') ? "armed" : "disarmed";
			}
		});

		this.homey.flow.getConditionCard('WT-RFID.EU-is_at_home')
		    .registerRunListener(( args, state, callback ) => {

				// Get the status of the requested user
				var user = this.getUserById(args.person.id);
				if (user !== null) {
					return callback(null, user.statusCode === 1); // we've fired successfully
				}

				return callback(new Error(__('flow.condition.userNotFound'))); // user not found.
			})
			.registerArgumentAutocompleteListener("person", async (query, args) => {
				var users = this.getUserContainer();
				return users.filter((user) => (user.name.toLowerCase().indexOf(query.toLowerCase()) > -1));
			});

		this.homey.flow.getConditionCard('WT-RFID.EU-system_is_armed')
			.registerRunListener(( args, state, callback ) => {
				return callback(null, this.isSystemArmed());
			});

		this.homey.flow.getActionCard('WT-RFID.EU-toggle_person_home')
			.registerRunListener(( args, state, callback ) => {

				// Set status of user to home
				this.updateUsersState([args.person], 'home');

				callback(null, true); // we've fired successfully
			})
			.registerArgumentAutocompleteListener("person", async (query, args) => {
				var users = this.getUserContainer();
				return users.filter((user) => (user.name.toLowerCase().indexOf(query.toLowerCase()) > -1));
			});

		this.homey.flow.getActionCard('WT-RFID.EU-toggle_person_away')
			.registerRunListener(( args, state, callback ) => {
			
				// Set status of user to away
				this.updateUsersState([args.person], 'away');
			
				callback(null, true); // we've fired successfully
			})
			.registerArgumentAutocompleteListener("person", async (query, args) => {
				var users = this.getUserContainer();
				return users.filter((user) => (user.name.toLowerCase().indexOf(query.toLowerCase()) > -1));
			});
			
		this.userSystemAwayTrigger = this.homey.flow.getDeviceTriggerCard('WT-RFID.EU-user_system_away');
		this.userSystemHomeTrigger = this.homey.flow.getDeviceTriggerCard('WT-RFID.EU-user_system_home');
		this.userHomeTrigger = this.homey.flow.getDeviceTriggerCard('WT-RFID.EU-user_home');
		this.userAwayTrigger = this.homey.flow.getDeviceTriggerCard('WT-RFID.EU-user_away');
		this.userUnknownTrigger = this.homey.flow.getDeviceTriggerCard('WT-RFID.EU-user_unknown');
	}

	triggerStateChange(alarmState, deviceId, tag, user) {

		var tokens = {
			userId: (user !== null ? user.id : 0),
			userName: (user !== null ? user.name : ''),
			tagId: (tag !== null ? tag.id : 0),
			deviceId: deviceId
		};

		if (alarmState === 'home') {
			// Trigger event, "User X came home"
			this.userHomeTrigger.trigger(this, tokens, {}, (err, result) => {
				if (err) {
					this.log(err);
					return this.homey.error(err);
				}
			});

			// Trigger event, "System armed"
			if (this.isSystemArmed() == true) {
				this.userSystemHomeTrigger.trigger(this, tokens, {}, (err, result) => {
					if (err) {
						this.log(err);
						return this.homey.error(err);
					}
				});
			}
			this.setSystemArmed(false);

			//log
			this.addLog(tokens.userId, tokens.deviceId, tokens.tagId, 1, tokens.userName);
		}

		if (alarmState === 'away') {
			// Trigger event, "User X went away"
			this.userAwayTrigger.trigger(this, tokens, {}, (err, result) => {
				if (err) {
					this.log(err);
					return this.homey.error(err);
				}
			});

			// Trigger event, "System disarmed"
			if (this.isSystemArmed() == false) {
				this.userSystemAwayTrigger.trigger(this, tokens, {}, (err, result) => {
					if (err) {
						this.log(err);
						return this.homey.error(err);
					}
				});
			}
			this.setSystemArmed(true);

			//log
			this.addLog(tokens.userId, tokens.deviceId, tokens.tagId, 0, tokens.userName);
		}

		return true;
	}

	/**
	 * get tags from settings
	 */
	getTagContainer()
	{
		return this.homey.settings.get('tagContainer');
	}

	/**
	 * write tags to settings
	 */
	setTagContainer(value)
	{
		this.homey.settings.set('tagContainer', value);
	}

	/**
	 * get users from settings
	 */
	getUserContainer()
	{
		return this.homey.settings.get('userContainer');
	}

	/**
	 * write users to settings
	 */
	setUserContainer(value)
	{
		this.homey.settings.set('userContainer', value);
	}

	/**
	 * checks if system is armed
	 *
	 * @return bool
	 */
	isSystemArmed()
	{
		return (this.homey.settings.get('systemArmed') === true);
	}

	/**
	 * set system armed to true or false
	 */
	setSystemArmed(value)
	{
		this.homey.settings.set('systemArmed', (value === true));
	}

	/**
	 * checks if new tags can be added
	 *
	 * @return bool
	 */
	canAddNewTags() {

		//cannot add new tags when user has not enabled it
		if (this.homey.settings.get('tagStatus') !== true) {
			return false;
		}

		//cannot add new tags when system is armed
		if (this.isSystemArmed()) {
			return false;
		}

		return true;
	}

	/**
	 * update user statusCode
	 * 
	 * @param Object user User object
	 * @param string alarmState alarm state code ('away' or 'home')
	 */
	updateUsersState(usersToUpdate, alarmState)
	{
		var userIdsToUpdate = new Array();
		for (let i=0; i<usersToUpdate.length; i++) {
			userIdsToUpdate.push(usersToUpdate[i].id);
		}

		var users = this.getUserContainer();
		for (let i=0; i<users.length; i++) {
			if (userIdsToUpdate.indexOf(users[i].id) > -1) {
				users[i].statusCode = (alarmState === 'away' ? 0 : 1);
			}
		}
		this.setUserContainer(users);
	}

	/**
	 * search for users linked to given tag
	 * 
	 * @param int tagId search for users with this tag id
	 */
	getUsersByTagId(tagId)
	{
		var foundUsers = new Array();
		var users = this.getUserContainer();
		for (var i=0; i<users.length; i++) {
			if (users[i].tagIds.indexOf(tagId) > -1) {
				foundUsers.push(users[i]);
			}
		}
		return foundUsers;
	}

	/**
	 * get tag by id
	 */
	getUserById(id)
	{
		var users = this.getUserContainer();
		for (let i=0; i<users.length; i++) {
			if (users[i].id === id) {
				return users[i];
			}
		}
		return null;
	}

	/**
	 * Add new tag to tags container
	 * 
	 * @param string userCode hex value of user code from tag reader
	 * @param int? tagId tag id when tag was removed and must added again
	 */
	addTag(userCode, tagId)
	{
		//get or add tag
		var tag = null;
		if (typeof tagId !== 'undefined') {
			tag = this.getTagById(tagId);
		} else {
			tag = this.getTagByUserCode(userCode);
		}
		
		//add tag when not found
		if (tag === null) {

			//get tags
			let tags = this.getTagContainer();

			//create new tag
			tag = {
				id: 0,
				name: '',
				userCode: userCode,
				createdOn: new Date()
			};

			//assign new of existing id
			if (typeof tagId === 'undefined') {
				for (let i = 0; i < tags.length; i++) {
					if (tags[i].id > tag.id) {
						tag.id = tags[i].id;
					}
				}
				tag.id++;
			} else {
				tag.id = tagId;
			}

			//set inital name
			tag.name = 'ID ' + tag.id;

			//add tag to container and save
			tags.push(tag);
			this.setTagContainer(tags);
		}

		//return (new) tag
		return tag;
	}

	/**
	 * get tag by usercode
	 */
	getTagByUserCode(userCode)
	{
		var tags = this.getTagContainer();
		for (let i=0; i<tags.length; i++) {
			if (tags[i].userCode === userCode) {
				return tags[i];
			}
		}
		return null;
	}

	/**
	 * get tag by id
	 */
	getTagById(id)
	{
		var tags = this.getTagContainer();
		for (let i=0; i<tags.length; i++) {
			if (tags[i].id === id) {
				return tags[i];
			}
		}
		return null;
	}

	/**
	 * Writes entry to log file
	 * statusCodes: 0 = away, 1 = home, 2 = tag added, 3 = Scene Started
	 */
	addLog(userId, deviceId, tagId, statusCode, userName)
	{
		const logEntry = {
			time: new Date(),
			userId: userId,
			userName: userName,
			tagId: tagId,
			statusCode: statusCode, // 0 = away, 1 = home, 2 = tag added, 3 = Scene Started, 4 = Unknown Tag, -1 = unknown
			deviceId: deviceId,
		};

		var log = this.homey.settings.get('systemEventLog');
		log.push(logEntry);
		
		// Only keep last 50 events from event log
		this.homey.settings.set('systemEventLog', log.slice(Math.max(log.length - 50, 0)));
	}
}

module.exports = ZipatoDevice;