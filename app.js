"use strict";

const Homey = require('homey');

class ZipatoApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
	}
}

module.exports = ZipatoApp;