/*
*	Application library for storing data as files
*
*/

//Dependencies
const fs = require('fs');
const path = require('path');
let helpers = require('./helpers');

// Define lib object
let lib = {};

// create the base directory property
lib.baseDir = path.join(__dirname, '/../.data/');

// Define create method
lib.create = function newFileCreation(dir, filename, data, callback) {
	//create new file 
	fs.open(`${lib.baseDir}${dir}/${filename}.json`, 'wx', (err, fileDescriptor) => {
		if(!err && fileDescriptor) {
			//Convert the data object to string
			let stringData = JSON.stringify(data);

			fs.writeFile(fileDescriptor, stringData, (err) => {
				if(!err) {
					fs.close(fileDescriptor, (err) => {
						if(!err) {
							callback(false);
						} else {
							callback('Error closing file.');
						}
					});
				} else {
					callback('Error writing data to file.');		
				}
			});
		} else {
			callback('Could not create new file, it may already exists');
		}
	});
};

//Define read method
lib.read = function readDataFromFile(dir, filename, callback) {
	// read the file
	fs.readFile(`${lib.baseDir}${dir}/${filename}.json`, 'utf8', (err, data) => {
		if(!err && data) {
			let parsedData = helpers.parseJsonToObject(data);
			console.log(parsedData);
			callback(false, parsedData);
		} else {
			callback(err, data);	
		}
	});
};

//Define update method
lib.update = function modifyDataInParticularFile(dir, filename, data, callback) {
	//update the particular file 
	fs.open(`${lib.baseDir}${dir}/${filename}.json`, 'r+' ,(err, fileDescriptor) => {
		if ( !err && fileDescriptor ) {
			//convert data to string
			let stringData = JSON.stringify(data);
			// truncate the file
			fs.ftruncate(fileDescriptor, (err) => {
				if(!err) {
					//write data to file
					fs.writeFile(fileDescriptor, stringData, (err) => {
						if(!err) {
							//close the new file
							fs.close(fileDescriptor, (err) => {
								if(!err) {
									callback(false);
								} else {
									callback('Error closing the existing file.')
								}
							});
						} else {
							callback('Error writing to existing file.');
						}
					});
				} else {
					callback('Error truncating the file.');
				}
			});
		} else {
			callback('Could not open the file for updating, it may not exist yet');
		}
	});
};

// delete the file
lib.delete = function removeTheParticularFile (dir, filename, callback ) {
	fs.unlink(`${lib.baseDir}${dir}/${filename}.json`, (err) => {
		if(!err) {
			callback(false);
		} else {
			callback('Error deleting file.')
		}
	});
}

// Export the lib module
module.exports = lib;