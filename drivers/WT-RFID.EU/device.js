'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

// https://www.zipato.com/product/mini-keypad-rfid
// https://file.m.nu/pdf/wt-rfid-eu_zipato.pdf

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');
		//this.registerCapability('alarm_battery', 'BATTERY');

		// register user_code_report capabilty for adding new tags
		this.registerCapability('user_code_report', 'USER_CODE', {
			report: 'USER_CODE_REPORT',
			reportParser: report => {

				// Get user or tag code
				var userCode = report.USER_CODE.toString('hex');
				this.userUnknownTrigger.trigger(this, {deviceId: this.getData().token, userCode: userCode}, {}, (err, result) => {
					if (err) {
						this.log(err);
						return Homey.error(err);
					}
				});

				// Check if tags can be added
				if (!canAddNewTags()) {
					addLog(null, this.getData().token, null, 4, null);
					return null;
				}

				// Add new tag
				var tag = addTag(userCode);

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
				addLog(null, this.getData().token, tag.id, 2, null, null);
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
			report: 'ALARM_REPORT',
			reportParser: report => {

				// Only handle events 5 (away) or 6 (home)
				var alarmState = null;
				switch (report['ZWave Alarm Event']) {
					case 5: alarmState = 'away'; break;
					case 6: alarmState = 'home'; break;
					default: return null;
				}

				// Search for tag
				var tag = getTagById(parseInt(report['Event Parameter'].toString('hex'), 16));
				if (tag === null) {
					// Check if tags can be added
					if (!canAddNewTags()) {
						addLog(null, this.getData().token, null, 4, null);
						return null;
					}

					// Add tag when tag was previously removed
					tag = addTag('(From device)', parseInt(report['Event Parameter'].toString('hex'), 16));
				}

				// Get all users linked to this tag
				var users = getUsersByTagId(tag.id);

				// Send trigger for tag when no users are linked to this tag
				if (users.length > 0) {

					// Update all user states
					updateUsersState(users, alarmState);

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

		let isAtHome = new Homey.FlowCardCondition('WT-RFID.EU-is_at_home');
		isAtHome
		    .register()
		    .registerRunListener(( args, state, callback ) => {

				// Get the status of the requested user
				var user = getUserById(args.person.id);
				if (user !== null) {
					return callback(null, user.statusCode === 1); // we've fired successfully
				}

				return callback(new Error(__('flow.condition.userNotFound'))); // user not found.
		    });

		let isArmed = new Homey.FlowCardCondition('WT-RFID.EU-system_is_armed');
		isArmed
			.register()
			.registerRunListener(( args, state, callback ) => {
				return callback(null, isSystemArmed());
			});

		let setPersonHome = new Homey.FlowCardAction('WT-RFID.EU-toggle_person_home');
		setPersonHome
			.register()
			.registerRunListener(( args, state, callback ) => {

				// Set status of user to home
				updateUsersState([args.person], 'home');

				callback(null, true); // we've fired successfully
			});

		let setPersonAway = new Homey.FlowCardAction('WT-RFID.EU-toggle_person_away');
		setPersonAway
			.register()
			.registerRunListener(( args, state, callback ) => {
			
				// Set status of user to away
				updateUsersState([args.person], 'away');
			
				callback(null, true); // we've fired successfully
			});

		function personAutocompleteListener(query, args, callback)
		{
			var users = getUserContainer();
			callback(null, users.filter((user) => (user.name.toLowerCase().indexOf(query.toLowerCase()) > -1)));
		}

		isAtHome.getArgument("person").registerAutocompleteListener(personAutocompleteListener)
		setPersonHome.getArgument("person").registerAutocompleteListener(personAutocompleteListener)
		setPersonAway.getArgument("person").registerAutocompleteListener(personAutocompleteListener)

		this.userSystemAwayTrigger = new Homey.FlowCardTriggerDevice('WT-RFID.EU-user_system_away').register();
		this.userSystemHomeTrigger = new Homey.FlowCardTriggerDevice('WT-RFID.EU-user_system_home').register();
		this.userHomeTrigger = new Homey.FlowCardTriggerDevice('WT-RFID.EU-user_home').register();
		this.userAwayTrigger = new Homey.FlowCardTriggerDevice('WT-RFID.EU-user_away').register();
		this.userUnknownTrigger = new Homey.FlowCardTriggerDevice('WT-RFID.EU-user_unknown').register();
	}

	triggerStateChange(alarmState, deviceId, tag, user) {

		var tokens = {
			userId: (user !== null ? user.id : null),
			userName: (user !== null ? user.name : null),
			tagId: (tag !== null ? tag.id : null),
			deviceId: deviceId
		};

		if (alarmState === 'home') {
			// Trigger event, "User X came home"
			this.userHomeTrigger.trigger(this, tokens, {}, (err, result) => {
				if (err) {
					this.log(err);
					return Homey.error(err);
				}
			});

			// Trigger event, "System armed"
			if (isSystemArmed() == true) {
				this.userSystemHomeTrigger.trigger(this, tokens, {}, (err, result) => {
					if (err) {
						this.log(err);
						return Homey.error(err);
					}
				});
			}
			setSystemArmed(false);

			//log
			addLog(tokens.userId, tokens.deviceId, tokens.tagId, 1, tokens.userName);
		}

		if (alarmState === 'away') {
			// Trigger event, "User X went away"
			this.userAwayTrigger.trigger(this, tokens, {}, (err, result) => {
				if (err) {
					this.log(err);
					return Homey.error(err);
				}
			});

			// Trigger event, "System disarmed"
			if (isSystemArmed() == false) {
				this.userSystemAwayTrigger.trigger(this, tokens, {}, (err, result) => {
					if (err) {
						this.log(err);
						return Homey.error(err);
					}
				});
			}
			setSystemArmed(true);

			//log
			addLog(tokens.userId, tokens.deviceId, tokens.tagId, 0, tokens.userName);
		}

		return true;
	}
}

/**
 * get tags from settings
 */
function getTagContainer()
{
	return Homey.ManagerSettings.get('tagContainer');
}

/**
 * write tags to settings
 */
function setTagContainer(value)
{
	Homey.ManagerSettings.set('tagContainer', value);
}

/**
 * get users from settings
 */
function getUserContainer()
{
	return Homey.ManagerSettings.get('userContainer');
}

/**
 * write users to settings
 */
function setUserContainer(value)
{
	Homey.ManagerSettings.set('userContainer', value);
}

/**
 * checks if system is armed
 *
 * @return bool
 */
function isSystemArmed()
{
	return (Homey.ManagerSettings.get('systemArmed') === true);
}

/**
 * set system armed to true or false
 */
function setSystemArmed(value)
{
	Homey.ManagerSettings.set('systemArmed', (value === true));
}

/**
 * checks if new tags can be added
 *
 * @return bool
 */
function canAddNewTags() {

	//cannot add new tags when user has not enabled it
	if (Homey.ManagerSettings.get('tagStatus') !== true) {
		return false;
	}

	//cannot add new tags when system is armed
	if (isSystemArmed()) {
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
function updateUsersState(usersToUpdate, alarmState)
{
	var userIdsToUpdate = new Array();
	for (let i=0; i<usersToUpdate.length; i++) {
		userIdsToUpdate.push(usersToUpdate[i].id);
	}

	var users = getUserContainer();
	for (let i=0; i<users.length; i++) {
		if (userIdsToUpdate.indexOf(users[i].id) > -1) {
			users[i].statusCode = (alarmState === 'away' ? 0 : 1);
		}
	}
	setUserContainer(users);
}

/**
 * search for users linked to given tag
 * 
 * @param int tagId search for users with this tag id
 */
function getUsersByTagId(tagId)
{
	var foundUsers = new Array();
	var users = getUserContainer();
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
function getUserById(id)
{
	var users = getUserContainer();
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
function addTag(userCode, tagId)
{
	//get or add tag
	var tag = null;
	if (typeof tagId !== 'undefined') {
		tag = getTagById(tagId);
	} else {
		tag = getTagByUserCode(userCode);
	}
	
	//add tag when not found
	if (tag === null) {

		//get tags
		let tags = getTagContainer();

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
		setTagContainer(tags);
	}

	//return (new) tag
	return tag;
}

/**
 * get tag by usercode
 */
function getTagByUserCode(userCode)
{
	var tags = getTagContainer();
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
function getTagById(id)
{
	var tags = getTagContainer();
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
function addLog(userId, deviceId, tagId, statusCode, userName)
{
	const logEntry = {
		time: new Date(),
		userId: userId,
		userName: userName,
		tagId: tagId,
		statusCode: statusCode, // 0 = away, 1 = home, 2 = tag added, 3 = Scene Started, 4 = Unknown Tag, -1 = unknown
		deviceId: deviceId,
	};

	var log = Homey.ManagerSettings.get('systemEventLog');
	log.push(logEntry);
	
	// Only keep last 50 events from event log
	Homey.ManagerSettings.set('systemEventLog', log.slice(Math.max(log.length - 50, 0)));
}

/**
 * init/upgrade settings
 */
function initSettings() {

	//check user container
	var userContainer = Homey.ManagerSettings.get('userContainer');
	if (typeof userContainer === 'undefined' || userContainer === null || typeof userContainer.push === 'undefined') {
		userContainer = new Array();
	}
	for (let i=0; i<userContainer.length; i++) {
		if (typeof userContainer[i].tagIds === 'undefined' || userContainer[i].tagIds === null || typeof userContainer[i].tagIds.push === 'undefined') {
			userContainer[i].tagIds = new Array();
		}
		if (typeof userContainer[i].name === 'undefined') {
			userContainer[i].name = '';
		}
		if (typeof userContainer[i].statusCode === 'undefined') {
			userContainer[i].statusCode = 1;
		}
	}
	Homey.ManagerSettings.set('userContainer', userContainer);

	//check tag container
	var tagContainer = Homey.ManagerSettings.get('tagContainer');
	if (typeof tagContainer === 'undefined' || tagContainer === null || typeof tagContainer.push === 'undefined') {
		tagContainer = new Array();
	}
	for (let i=0; i<tagContainer.length; i++) {
		if (typeof tagContainer[i].id === 'undefined') {
			tagContainer[i].id = tagContainer[i].tagId;
		}
		if (typeof tagContainer[i].userCode === 'undefined') {
			tagContainer[i].userCode = tagContainer[i].tagValue;
		}
		if (typeof tagContainer[i].name === 'undefined' || tagContainer[i].name === '') {
			tagContainer[i].name = 'ID ' + tagContainer[i].id;
		}
		delete tagContainer[i].tagId;
		delete tagContainer[i].tagValue;
		delete tagContainer[i].tagType;
	}
	Homey.ManagerSettings.set('tagContainer', tagContainer);

	//check event log
	var log = Homey.ManagerSettings.get('systemEventLog');
	if (typeof log === 'undefined' || log === null || typeof log.push === 'undefined') {
		Homey.ManagerSettings.set('systemEventLog', new Array());
	}	

	//check tagStatus
	if (Homey.ManagerSettings.get('tagStatus') !== true && Homey.ManagerSettings.get('tagStatus') !== false) {
		Homey.ManagerSettings.set('tagStatus', false);
	}

	//check systemArmed
	if (Homey.ManagerSettings.get('systemArmed') !== true && Homey.ManagerSettings.get('systemArmed') !== false) {
		Homey.ManagerSettings.set('systemArmed', false);
	}
}
initSettings();

module.exports = ZipatoDevice;