'use strict';

const Homey = require('homey');

class ZipatoDriver extends Homey.Driver {
	async onInit() {
		this.log('ZipatoDriver has been initialized');
		this.initSettings();
	}

	/**
	 * init/upgrade settings
	 */
	initSettings() {

		//check user container
		var userContainer = this.homey.settings.get('userContainer');
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
		this.homey.settings.set('userContainer', userContainer);

		//check tag container
		var tagContainer = this.homey.settings.get('tagContainer');
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
		this.homey.settings.set('tagContainer', tagContainer);

		//check event log
		var log = this.homey.settings.get('systemEventLog');
		if (typeof log === 'undefined' || log === null || typeof log.push === 'undefined') {
			this.homey.settings.set('systemEventLog', new Array());
		}	

		//check tagStatus
		if (this.homey.settings.get('tagStatus') !== true && this.homey.settings.get('tagStatus') !== false) {
			this.homey.settings.set('tagStatus', false);
		}

		//check systemArmed
		if (this.homey.settings.get('systemArmed') !== true && this.homey.settings.get('systemArmed') !== false) {
			this.homey.settings.set('systemArmed', false);
		}
	}
}

module.exports = ZipatoDriver;