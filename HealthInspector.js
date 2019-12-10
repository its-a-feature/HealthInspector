//Author Cody Thomas, @its_a_feature_
//All of these functions use Objective C API calls to read PLIST files from an unauthenticated context
//Helper Functions -----------------------------------
function hex2a(hexx) {
    let hex = hexx.toString();//force conversion
    let str = '';
    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
function get_permissions(path){
	let fileManager = $.NSFileManager.defaultManager;
	attributes = ObjC.deepUnwrap(fileManager.attributesOfItemAtPathError($(path), $()));
	//return attributes;
    let trimmed_attributes = {};
    if(attributes === undefined){
    	return ["Failed to get permissions"];
    }
    trimmed_attributes['NSFileOwnerAccountID'] = attributes['NSFileOwnerAccountID'];
    trimmed_attributes['NSFileExtensionHidden'] = attributes['NSFileExtensionHidden'];
    trimmed_attributes['NSFileGroupOwnerAccountID'] = attributes['NSFileGroupOwnerAccountID'];
    trimmed_attributes['NSFileOwnerAccountName'] = attributes['NSFileOwnerAccountName'];
    trimmed_attributes['NSFileCreationDate'] = attributes['NSFileCreationDate'];
    let nsposix = attributes['NSFilePosixPermissions'];
    // we need to fix this mess to actually be real permission bits that make sense
    let posix = ((nsposix >> 6) & 0x7).toString() + ((nsposix >> 3) & 0x7).toString() + (nsposix & 0x7).toString();
    trimmed_attributes['NSFilePosixPermissions'] = posix;
    trimmed_attributes['NSFileGroupOwnerAccountName'] = attributes['NSFileGroupOwnerAccountName'];
    trimmed_attributes['NSFileModificationDate'] = attributes['NSFileModificationDate'];
    return trimmed_attributes;
}
function file_exists(path){
	let fileManager = $.NSFileManager.defaultManager;
	return fileManager.fileExistsAtPath($(path));
}
//-------------------------------------------------
function Persistent_Dock_Apps({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.apple.dock.plist")){
		if(json==false){
			return "**************************************\n" + "**** Persistent Dock Applications ****\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Persistent_Dock_Apps"});
		}
	}

	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.dock.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['persistent-dock-apps'] = [];
	for(let i = 0; i < contents['persistent-apps'].length; i++){
		output['persistent-dock-apps'].push({"label": contents['persistent-apps'][i]['tile-data']['file-label'],
											 "bundle": contents['persistent-apps'][i]['tile-data']['bundle-identifier']});
	}
	for(let i = 0; i < contents['persistent-others'].length; i++){
		output['persistent-dock-apps'].push({"label": contents['persistent-others'][i]['tile-data']['file-label'],
											 "bundle": contents['persistent-others'][i]['tile-data']['bundle-identifier']});
	}
	if(json==false){
		output = "**************************************\n" + "**** Persistent Dock Applications ****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	} 
	else{
		output['HealthInspectorCommand'] = "Persistent_Dock_Apps";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Spaces_Check({help=false, json=false} = {}){
	if(help){
		let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.apple.spaces.plist")){
		if(json==false){
			return "**************************************\n" + "******** Desktops Information ********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Spaces_Check"});
		}
	}
	
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.spaces.plist");
	let contents = ObjC.deepUnwrap(dict);
	let monitors = contents['SpacesDisplayConfiguration']['Management Data']['Monitors'];
	for(let i = 0; i < monitors.length; i++){
		if(monitors[i]['Display Identifier'] == "Main"){
			let currentSpaceID = monitors[i]['Current Space']['ManagedSpaceID'];
			let currentSpacePlace = 0;
			let totalSpaces = monitors[i]['Spaces'].length;
			for(let j = 0; j < monitors[i]['Spaces'].length; j++){
				if(currentSpaceID == monitors[i]['Spaces'][j]['ManagedSpaceID']){
					currentSpacePlace = j + 1;
				}
			}
			output['Main Desktop'] = {};
			output['Main Desktop']['Current Space'] = currentSpacePlace;
			output['Main Desktop']['Total Spaces'] = totalSpaces;
		}
	}
	if(json==false){
		output = "**************************************\n" + "******** Desktops Information ********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}
	else{
		output['HealthInspectorCommand'] = "Spaces_Check";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}
function Get_Office_Email({help=false, json=false} = {}){
	if(help){
		let output = "";
		return output;
	}
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.microsoft.office.plist")){
		if(json==false){
			return "**************************************\n" + "****** Registered Office Email ******\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Get_Office_Email"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.microsoft.office.plist");
	let contents = ObjC.deepUnwrap(dict);
	let output = {};
	if(contents != {} && contents != undefined){
		output['email'] = contents['OfficeActivationEmailAddress'];
		if(json==false){
			output = "**************************************\n" + "****** Registered Office Email ******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
		}else{
			output['HealthInspectorCommand'] = "Get_Office_Email";
			output = JSON.stringify(output, null, 1);
		}
	}
	return output;}
function Saved_Printers({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/org.cups.PrintingPrefs.plist")){
		if(json==false){
			return "**************************************\n" + "********* Last Used Printers *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Saved_Printers"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/org.cups.PrintingPrefs.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['LastUsedPrinters'] = [];
	if(contents != undefined){
		for(let i = 0; i < contents['LastUsedPrinters'].length; i++){
			output['LastUsedPrinters'].push({"Network": contents['LastUsedPrinters'][i]['Network'],
											 "PrinterID": contents['LastUsedPrinters'][i]['PrinterID']});
		}
		if(json==false){
			output = "**************************************\n" + "********* Last Used Printers *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
		}else{
			output['HealthInspectorCommand'] = "Saved_Printers";
			output = JSON.stringify(output, null, 1);
		}
	}	
	return output;}
function Finder_Preferences({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.apple.finder.plist")){
		if(json==false){
			return "**************************************\n" + "** Recent Folders and Finder Prefs **\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Finder_Preferences"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.finder.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Recent Move and Copy Destinations'] = contents['RecentMoveAndCopyDestinations'];
	output['Finder GoTo Folder Recents'] = contents['GoToFieldHistory'];
	output['Show All Files in Finder'] = contents['AppleShowAllFiles'];
	output['Show Removable Media on Desktop'] = contents['ShowRemovableMediaOnDesktop'];
	output['Tag Names'] = contents['FavoriteTagNames'];
	output['Recent Folders'] = [];
	for(let i = 0; i < contents['FXRecentFolders'].length; i++){
		output['Recent Folders'].push(contents['FXRecentFolders'][i]['name']);
	}
	output['Prior Mounted Volumes'] = Object.keys(contents['FXDesktopVolumePositions']);
	if(json==false){
		output = "**************************************\n" + "** Recent Folders and Finder Prefs **\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Finder_Preferences";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}
function Launch_Services({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist")){
		if(json==false){
			return "**************************************\n" + "*** Custom LaunchServices Handlers ***\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Launch_Services"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['LSHandlers_FileExtensions'] = [];
	output['LSHandlers_URLSchemes'] = [];
	if(contents != undefined){
		for(let i = 0; i < contents['LSHandlers'].length; i++){
			if(contents['LSHandlers'][i].hasOwnProperty('LSHandlerContentTag')){
				output['LSHandlers_FileExtensions'].push({"file_extension": contents['LSHandlers'][i]['LSHandlerContentTag'],
														  "handler": contents['LSHandlers'][i]['LSHandlerRoleAll']});
			}
			else if(contents['LSHandlers'][i].hasOwnProperty('LSHandlerURLScheme')){
				output['LSHandlers_URLSchemes'].push({"URLScheme": contents['LSHandlers'][i]['LSHandlerURLScheme'],
														  "handler": contents['LSHandlers'][i]['LSHandlerRoleAll'],
														  "viewer": contents['LSHandlers'][i]['LSHandlerRoleViewer']});
			}
			else{
				output['LSHandlers_URLSchemes'].push({"ContentType": contents['LSHandlers'][i]['LSHandlerContentType'],
														  "handler": contents['LSHandlers'][i]['LSHandlerRoleAll'],
														"viewer": contents['LSHandlers'][i]['LSHandlerRoleViewer']});
			}
		}
	}
	if(json==false){
		output = "**************************************\n" + "*** Custom LaunchServices Handlers ***\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Launch_Services";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Universal_Access_Auth_Warning({help=false, json=false} = {}){
	// information on all apps that macOS has ever thrown the ‘some.app would like permission to control your computer
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.apple.universalaccessAuthWarning.plist")){
		if(json==false){
			return "**************************************\n" + "**** UniversalAccess Auth Warning ****\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Universal_Access_Auth_Warning"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.universalaccessAuthWarning.plist");
	let contents = ObjC.deepUnwrap(dict);
	if(contents != {}){
		output['Universal Access Auth Warning Applications'] = contents;
	}
	if(json==false){
		output = "**************************************\n" + "**** UniversalAccess Auth Warning ****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Universal_Access_Auth_Warning";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Relaunch_At_Login({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	let files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/Library/Preferences/ByHost", Ref()));
	output['Relaunch Apps'] = [];
	for(i in files){
		if(files[i].includes("com.apple.loginwindow") && files[i].endsWith(".plist")){
			let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/ByHost/" + files[i]);
			output['Relaunch Apps'] = ObjC.deepUnwrap(dict)['TALAppsToRelaunchAtLogin'];
			break;
		}
	}
	if(json==false){
		output = "**************************************\n" + "* Applications to Relaunch at Login *\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Relaunch_At_Login";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Login_Items({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/com.apple.loginitems.plist")){
		if(json==false){
			return "**************************************\n" + "************ Login Items ************\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Login_Items"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.loginitems.plist");
	let contents = ObjC.deepUnwrap(dict);
	if(contents != {}){
		output['Login_Items'] = contents;
	}
	if(json==false){
		output = "**************************************\n" + "************ Login Items ************\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Login_Items";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function User_Dir_Hidden_Files_Folders({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = [];
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	let files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath, Ref()));
	for(i in files){
		if(files[i][0] == "."){
			output.push(files[i]);
		}
	}
	if(json==false){
		output = "**************************************\n" + "***** Hidden Files/Folders in ~ *****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "User_Dir_Hidden_Files_Folders";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function User_Global_Preferences({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Preferences/.GlobalPreferences.plist")){
		if(json==false){
			return "**************************************\n" + "***** User's Global Preferences *****\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "User_Global_Preferences"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/.GlobalPreferences.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Default Web Service'] = contents['NSPreferredWebServices']['NSWebServicesProviderWebSearch']['NSDefaultDisplayName'] + " - " + contents['NSPreferredWebServices']['NSWebServicesProviderWebSearch']['NSProviderIdentifier']
	output['Recent Places'] = contents['NSNavRecentPlaces'];
	output['Finder Sync Extensions'] = Object.keys(contents['com.apple.finder.SyncExtensions']['dirMap']);
	output['Show All Extensions'] = contents['AppleShowAllExtensions'];
	if(json==false){
		output = "**************************************\n" + "***** User's Global Preferences *****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "User_Global_Preferences";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function User_Launchagents({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	let files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/Library/LaunchAgents/", Ref()));
	for(i in files){
		let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/LaunchAgents/" + files[i]);
		dict = ObjC.deepUnwrap(dict);
		if(dict !== undefined && dict.hasOwnProperty('ProgramArguments')){
            dict['Program Attributes'] = get_permissions(dict['ProgramArguments'][0]);
            program_dir = dict['ProgramArguments'][0].split("/");
            program_dir.pop();
            program_dir = "/" + program_dir.join("/");
            dict['Program Directory Attributes'] = get_permissions(program_dir);
		}
		else if(dict !== undefined && dict.hasOwnProperty('Program')){
			dict['Program Attributes'] = get_permissions(dict['Program']);
            program_dir = dict['Program'].split("/");
            program_dir.pop();
            program_dir = "/" + program_dir.join("/");
            dict['Program Directory Attributes'] = get_permissions(program_dir);
		}
		output[files[i]] = dict;
		
	}
	if(json==false){
		output = "**************************************\n" + "***** User's Launch Agents *****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "User_Launchagents";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function User_Launchdaemons({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	let files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/Library/LaunchDaemons/", Ref()));
	for(i in files){
		let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/LauncDaemons/" + files[i]);
		dict = ObjC.deepUnwrap(dict);
		if(dict != undefined && dict.hasOwnProperty('ProgramArguments')){
            dict['Program Attributes'] = get_permissions(dict['ProgramArguments'][0]);
            program_dir = dict['ProgramArguments'][0].split("/");
            program_dir.pop();
            program_dir = "/" + program_dir.join("/");
            dict['Program Directory Attributes'] = get_permissions(program_dir);
		}
		else if(dict !== undefined && dict.hasOwnProperty('Program')){
			dict['Program Attributes'] = get_permissions(dict['Program']);
            program_dir = dict['Program'].split("/");
            program_dir.pop();
            program_dir = "/" + program_dir.join("/");
            dict['Program Directory Attributes'] = get_permissions(program_dir);
		}
		output[files[i]] = dict;
		 
	}
	if(json==false){
		output = "**************************************\n" + "***** User's Launch Daemons *****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "User_Launchdaemons";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Installed_Software_Versions({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	if(!file_exists("/Library/Receipts/InstallHistory.plist")){
		if(json==false){
			return "**************************************\n" + "********** Software Verions  *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Installed_Software_Versions"});
		}
	}
	let dict = $.NSArray.alloc.initWithContentsOfFile("/Library/Receipts/InstallHistory.plist");
	let contents = ObjC.deepUnwrap(dict);
	for(let i in contents){
		if(!output.hasOwnProperty(contents[i]['displayName'])){
			output[contents[i]['displayName']] = {};
		}
		if(output[contents[i]['displayName']]['version'] == undefined ||
			output[contents[i]['displayName']]['version'] < contents[i]['displayVersion']){
			// update our information if we find a newer version listed
			output[contents[i]['displayName']]['date'] = contents[i]['date'];
			output[contents[i]['displayName']]['version'] = contents[i]['displayVersion'];
			output[contents[i]['displayName']]['processName'] = contents[i]['processName'];
		}
		
	}
	if(json==false){
		output = "**************************************\n" + "********** Software Verions  *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Installed_Software_Versions";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Local_Account_File({help=false, json=false} = {}){
	//Note: this file will probably only exist for mobile accounts tied to AD
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/.account")){
		if(json==false){
			return "**************************************\n" + "******** Local .account File  ********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Local_Account_File"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/.account");
	let contents = ObjC.deepUnwrap(dict);
	if(json==false){
		output = "**************************************\n" + "******** Local .account File  ********\n" + "**************************************\n" + JSON.stringify(contents, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Local_Account_File";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
// ----------- user data mining functions -------------
function Unique_Bash_History_Sessions({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	let files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/.bash_sessions/", Ref()));
	let final_commands = new Set();
	for(i in files){
		let list = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/.bash_sessions/" + files[i], $.NSUTF8StringEncoding, $()).js.split("\n");
		for(let j in list){
			final_commands.add(list[j]);
		}
	}
	let list = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/.bash_history", $.NSUTF8StringEncoding, $()).js;
	if(list != undefined){
		list = list.split("\n");
		for(let j in list){
			final_commands.add(list[j]);
		}
	}
	output['commands'] = Array.from(final_commands);
	if(json==false){
		output = "**************************************\n" + "******* Unique Bash History *******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Unique_Bash_History_Sessions";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function SSH_Keys({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	let files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/.ssh", Ref()));
	for(i in files){
		let dict = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/.ssh/" + files[i], $.NSUTF8StringEncoding, $());
		dict = ObjC.deepUnwrap(dict);
		output[files[i]] = dict;
		
	}
	if(json==false){
		output = "**************************************\n" + "********* SSH Key Files *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "SSH_Keys";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Read_Local_Group_Lists({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/private/etc/group")){
		if(json==false){
			return "**************************************\n" + "********* Local Groups *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Read_Local_Group_Lists"});
		}
	}
	let dict = $.NSString.alloc.initWithContentsOfFileEncodingError("/private/etc/group", $.NSUTF8StringEncoding, $()).js.split("\n");
	let lines = [];
	for(let i in dict){
		if(!dict[i].includes("#")){
			lines.push(dict[i]);
		}
	}
	output["Groups"] = lines;
	if(json==false){
		output = "**************************************\n" + "********* Local Groups *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Read_Local_Group_Lists";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}
function Slack_Download_Cache_History({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Application Support/Slack/storage/slack-downloads")){
		if(json==false){
			return "**************************************\n" + "********* Slack Downloads *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Slack_Download_Cache_History"});
		}
	}
	let dict = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/Library/Application Support/Slack/storage/slack-downloads", $.NSUTF8StringEncoding, $()).js;
	if(dict != "" && dict != undefined){
		dict = JSON.parse(dict);
		team_keys = Object.keys(dict);
		output['slack download cache history'] = [];
		for(let team_key in team_keys){
			let file_keys = Object.keys(dict[team_keys[team_key]]);
			for(let file_key in file_keys){
				output['slack download cache history'].push({"url":dict[team_keys[team_key]][file_keys[file_key]]['url'], "download path": dict[team_keys[team_key]][file_keys[file_key]]['downloadPath']});
			}
		}
	}
	if(json==false){
		output = "**************************************\n" + "********* Slack Downloads *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Slack_Download_Cache_History";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Slack_Team_Information({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	if(!file_exists(currentUserPath + "/Library/Application Support/Slack/storage/slack-teams")){
		if(json==false){
			return "**************************************\n" + "********* Slack Team Info *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Slack_Team_Information"});
		}
	}
	let dict = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/Library/Application Support/Slack/storage/slack-teams", $.NSUTF8StringEncoding, $()).js;
	if(dict != "" && dict != undefined){
		dict = JSON.parse(dict);
		keys = Object.keys(dict);
		for(let key in keys){
			delete dict[keys[key]]['theme'];
			delete dict[keys[key]]['icons'];
		}
		output['slack team information'] = dict;
	}
	if(json==false){
		output = "**************************************\n" + "********* Slack Team Info *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Slack_Team_Information";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Recent_Files({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	let currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	output['Recent Applications'] = [];
	if(!file_exists(currentUserPath + "/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.RecentApplications.sfl2")){
		if(json==false){
			return "**************************************\n" + "***** User's recent applications *****\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Recent_Files"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.RecentApplications.sfl2");
	let contents = ObjC.deepUnwrap(dict);
	if(contents === undefined){
		if(json==false){
			return "**************************************\n" + "***** User's recent applications *****\n" + "**************************************\n" + "Blocked by TCC";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Recent_Files"});
		}
	}
	for(let i = 0; i < contents['$objects'].length; i++){
		if(typeof contents['$objects'][i] == "string" && contents['$objects'][i].includes(".app")){
			output['Recent Applications'].push(contents['$objects'][i]);
		}
	}
	if(json==false){
		output = "**************************************\n" + "***** User's recent applications *****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Recent_Files";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
//------------ globally readable plists with interesting info ------------------
function Firewall({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/com.apple.alf.plist")){
		if(json==false){
			return "**************************************\n" + "******* Firewall Preferences *******\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Firewall"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.apple.alf.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Exceptions'] = [];
	for(let i = 0; i < contents['exceptions'].length; i++){
		if(contents['exceptions'][i].hasOwnProperty('bundleid')){
			let item = {};
			item['path'] = contents['exceptions'][i]['path'];
			item['bundleID'] = contents['exceptions'][i]['bundleid'];
			output['Exceptions'].push(item);
		}
		else{
			output['Exceptions'].push(contents['exceptions'][i]['path']);
		}
	}
	output['Explicit Auths'] = [];
	for(let i = 0; i < contents['explicitauths'].length; i++){
		output['Explicit Auths'].push(contents['explicitauths'][i]['id']);
	}
	output['Global State'] = contents['globalstate'];
	firewall_keys = Object.keys(contents['firewall']);
	for(i in firewall_keys){
		let status = contents['firewall'][firewall_keys[i]]['state'];
		output[firewall_keys[i]] = {};
		if(status == 0){
			output[firewall_keys[i]]['status'] = "Disabled";
		}else{
			output[firewall_keys[i]]['status'] = "Enabled";
		}
		output[firewall_keys[i]]['Process'] = contents['firewall'][firewall_keys[i]]['proc'];
		output[firewall_keys[i]]['BundleID'] = contents['firewall'][firewall_keys[i]]['servicebundleid'];
	}
	output['Stealth Enabled'] = contents['stealthenabled'];
	output['Logging'] = contents['loggingenabled'];
	if(json==false){
		output = "**************************************\n" + "******* Firewall Preferences *******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Firewall";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Airport_Preferences({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/SystemConfiguration/com.apple.airport.preferences.plist")){
		if(json==false){
			return "**************************************\n" + "******** Airport Preferences ********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Airport_Preferences"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/com.apple.airport.preferences.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Known Networks'] = [];
	let wifi_keys = Object.keys(contents['KnownNetworks']);
	let hex_to_ssid = {};
	for(let i in wifi_keys){
		hex_to_ssid[wifi_keys[i]] = contents['KnownNetworks'][wifi_keys[i]]['SSIDString'];
	}
	for(let i in wifi_keys){
		let SSID = contents['KnownNetworks'][wifi_keys[i]]['SSIDString'];
		let SecurityType = contents['KnownNetworks'][wifi_keys[i]]['SecurityType'];
		let lastConnected = contents['KnownNetworks'][wifi_keys[i]]['LastConnected'];
		let wasCaptive = contents['KnownNetworks'][wifi_keys[i]]['NetworkWasCaptive'];
		let captiveBypass = contents['KnownNetworks'][wifi_keys[i]]['CaptiveBypass'];
		let collocatedGroup = [];
		for(let j = 0; j < contents['KnownNetworks'][wifi_keys[i]]['CollocatedGroup'].length; j++){
			collocatedGroup.push(hex_to_ssid[contents['KnownNetworks'][wifi_keys[i]]['CollocatedGroup'][j]]);
		}
		output['Known Networks'].push({"SSID": SSID, "Security": SecurityType, "Last Connection": lastConnected,
									   "Was Captive": wasCaptive, "Captive Bypass": captiveBypass,
									   "Nearby Networks": collocatedGroup})
	}
	if(json==false){
		output = "**************************************\n" + "******** Airport Preferences ********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Airport_Preferences";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function SMB_Server({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/SystemConfiguration/com.apple.smb.server.plist")){
		if(json==false){
			return "**************************************\n" + "******* SMB Server Preferences *******\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "SMB_Server"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/com.apple.smb.server.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Local Kerberos Realm'] = contents['LocalKerberosRealm'];
	output['NETBIOS Name'] = contents['NetBIOSName'];
	output['Server Description'] = contents['ServerDescription'];
	if(json==false){
		output = "**************************************\n" + "******* SMB Server Preferences *******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "SMB_Server";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function WiFi_Messages({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/SystemConfiguration/com.apple.wifi.message-tracer.plist")){
		if(json==false){
			return "**************************************\n" + "********* WiFi Associations *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "WiFi_Messages"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/com.apple.wifi.message-tracer.plist");
	let contents = ObjC.deepUnwrap(dict);
	if(contents != undefined){
		let associationKeys = Object.keys(contents['AssociationSSIDMap']);
		output['Association SSIDs'] = [];
		for(let i in associationKeys){
			let condensed = associationKeys[i].replace(/ /g, '');
			condensed = condensed.substring(1, condensed.length-1)
			output['Association SSIDs'].push(hex2a(condensed));
		}
		associationKeys = Object.keys(contents['InternalAssociationSSIDMap']);
		output['InternalAssociation SSIDs'] = [];
		for(let i in associationKeys){
			let condensed = associationKeys[i].replace(/ /g, '');
			condensed = condensed.substring(1, condensed.length-1)
			output['InternalAssociation SSIDs'].push(hex2a(condensed));
		}
		if(json==false){
			output = "**************************************\n" + "********* WiFi Associations *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
		}else{
			output['HealthInspectorCommand'] = "WiFi_Messages";
			output = JSON.stringify(output, null, 1);
		}
		
	}
	return output;}
function Network_Interfaces({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/SystemConfiguration/NetworkInterfaces.plist")){
		if(json==false){
			return "**************************************\n" + "********* Network Interfaces *********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Network_Interfaces"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/NetworkInterfaces.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Network Interfaces'] = {};
	for(let i = 0; i < contents['Interfaces'].length; i++){
		output['Network Interfaces'][contents['Interfaces'][i]['BSD Name']] = {};
		output['Network Interfaces'][contents['Interfaces'][i]['BSD Name']]['Active'] = contents['Interfaces'][i]['Active'];
		output['Network Interfaces'][contents['Interfaces'][i]['BSD Name']]['Built In'] = contents['Interfaces'][i]['IOBuiltin'];
		output['Network Interfaces'][contents['Interfaces'][i]['BSD Name']]['Network Type'] = contents['Interfaces'][i]['SCNetworkInterfaceType'];
		output['Network Interfaces'][contents['Interfaces'][i]['BSD Name']]['Info'] = contents['Interfaces'][i]['SCNetworkInterfaceInfo'];
	}
	if(json==false){
		output = "**************************************\n" + "********* Network Interfaces *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Network_Interfaces";
		output = JSON.stringify(output, null, 1);
	}
	return output;}
function Bluetooth_Connections({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/com.apple.Bluetooth.plist")){
		if(json==false){
			return "**************************************\n" + "******* Bluetooth Connections *******\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Bluetooth_Connections"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.apple.Bluetooth.plist");
	let contents = ObjC.deepUnwrap(dict);
	if(contents != undefined && contents.hasOwnProperty('DeviceCache')){
		let Bluetooth_Keys = Object.keys(contents['DeviceCache']);
		let string_to_name = {};
		for(let i in Bluetooth_Keys){
			string_to_name[Bluetooth_Keys[i]] = contents['DeviceCache'][Bluetooth_Keys[i]]['Name'];
		}
		output['Device Cache'] = [];
		for(let i in Bluetooth_Keys){
			let  ClassOfDevice = undefined;
			if(contents['DeviceCache'][Bluetooth_Keys[i]].hasOwnProperty('ClassOfDevice')){
				ClassOfDevice = contents['DeviceCache'][Bluetooth_Keys[i]]['ClassOfDevice'].toString(16);
			}
			let displayName = contents['DeviceCache'][Bluetooth_Keys[i]]['displayName'];
			let name = contents['DeviceCache'][Bluetooth_Keys[i]]['Name'];
			let lastConnected = contents['DeviceCache'][Bluetooth_Keys[i]]['LastInquiryUpdate'];
			let lastNameUpdate = contents['DeviceCache'][Bluetooth_Keys[i]]['LastNameUpdate'];
			output['Device Cache'].push({"Name": name, "Class of Device": ClassOfDevice, "Last Connected": lastConnected, "Last Updated": lastNameUpdate, "Display Name": displayName})
		}
		output['Currently Paired Devices'] = [];
		for(let i = 0; i < contents['PairedDevices'].length; i++){
			output['Currently Paired Devices'].push(string_to_name[contents['PairedDevices'][i]]);
		}
		if(json==false){
			output = "**************************************\n" + "******* Bluetooth Connections *******\n" + "**************************************\n" + "Convert Class of Device with: http://domoticx.com/bluetooth-class-of-device-list-cod/\n" + JSON.stringify(output, null , 1);
		}else{
			output['HealthInspectorCommand'] = "Bluetooth_Connections";
			output = JSON.stringify(output, null, 1);
		}
	}	
	return output;}
function OS_Version({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/System/Library/CoreServices/SystemVersion.plist")){
		if(json==false){
			return "**************************************\n" + "********** OS Version Info  **********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "OS_Version"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/System/Library/CoreServices/SystemVersion.plist");
	output = ObjC.deepUnwrap(dict);
	if(json==false){
		output = "**************************************\n" + "********** OS Version Info  **********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "OS_Version";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}
function Krb5_AD_Config({help=false, json=false}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/etc/krb5.conf")){
		if(json==false){
			return "**************************************\n" + "********** AD Config  **********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Krb5_AD_Config"});
		}
	}
	let dict = $.NSString.alloc.initWithContentsOfFileEncodingError("/etc/krb5.conf", $.NSUTF8StringEncoding, $());
	output = {"config": dict};
	if(json==false){
		output = "**************************************\n" + "********** AD Config  **********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Krb5_AD_Config";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}
function Krb5_AD_Logging({help=false, json=false} = {}){
	if(help){
	    let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/com.apple.Kerberos.plist")){
		if(json==false){
			return "**************************************\n" + "********** Krb5 Logging  **********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Krb5_AD_Logging"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.apple.Kerberos.plist");
	output = ObjC.deepUnwrap(dict);
	if(json==false){
		output = "**************************************\n" + "********** Krb5 Logging  **********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Krb5_AD_Logging";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}

function PaloaltoGlobalProtect({help=false, json=false} = {}){
	if(help){
		let output = "";
		return output;
    }
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Preferences/com.paloaltonetworks.GlobalProtect.settings.plist")){
		if(json==false){
			return "**************************************\n" + "********** PaloaltoGlobalProtect portal  **********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "PaloaltoGlobalProtect"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.paloaltonetworks.GlobalProtect.settings.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Global Protect Portal'] = contents['Palo Alto Networks']['GlobalProtect']['PanSetup']['Portal'];
	output['Prelogon'] = contents['Palo Alto Networks']['GlobalProtect']['PanSetup']['Prelogon'];
	if(json==false){
		output = "****************************************************\n" + "***** Paloalto Networks Global Protect Portal *****\n" + "****************************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Check_PaloaltoGlobalProtect";
		output = JSON.stringify(output, null, 1);
	}

	return output;}

function Forcepoint_DLP_Information({help=false, json=false} = {}){
	if(help){
		let output = "";
		return output;
	}
	let output = {};
	let fileManager = $.NSFileManager.defaultManager;
	if(!file_exists("/Library/Application Support/Websense Endpoint/DLP/DLPClient.plist")){
		if(json==false){
			return "**************************************\n" + "********** Forcepoint DLP Information  **********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"HealthInspectorCommand": "Forcepoint_DLP_Information"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Application Support/Websense Endpoint/DLP/DLPClient.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['Connection domain name'] = contents['Connection domain name'];
	output['Connection status'] = contents['Connection status'];
	output['Connection user name'] = contents['Connection user name'];
	output['Discovery status'] = contents['Discovery status'];
	output['Endpoint profile name'] = contents['Endpoint profile name'];
	output['Endpoint silent mode'] = contents['Endpoint silent mode'];
	output['Endpoint status'] = contents['Endpoint status'];
	output['Fingerprint version'] = contents['Fingerprint version'];
	output['Policy version'] = contents['Policy version'];
	output['Profile version'] = contents['Profile version'];
	output['Remote bypass'] = contents['Remote bypass'];
	if(json==false){
		output = "********************************\n" + "***** Forcepoint DLP Info *****\n" + "********************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "Forcepoint_DLP_Information";
		output = JSON.stringify(output, null, 1);
	}

	return output;}

//---------------------------------------------------------
function All_Checks({help=false, json=false} = {}){
	let output = "";
	output += "\n" + Persistent_Dock_Apps({"help":help, "json":json});
	output += "\n" + Spaces_Check({"help":help, "json":json});
	output += "\n" + Get_Office_Email({"help":help, "json":json});
	output += "\n" + Saved_Printers({"help":help, "json":json});
	output += "\n" + Finder_Preferences({"help":help, "json":json});
	output += "\n" + Launch_Services({"help":help, "json":json});
	output += "\n" + Universal_Access_Auth_Warning({"help":help, "json":json});
	output += "\n" + Relaunch_At_Login({"help":help, "json":json});
	output += "\n" + Login_Items({"help":help, "json":json});
	output += "\n" + User_Dir_Hidden_Files_Folders({"help":help, "json":json});
	output += "\n" + User_Global_Preferences({"help":help, "json":json});
	output += "\n" + User_Launchagents({"help":help, "json":json});
	output += "\n" + User_Launchdaemons({"help":help, "json":json});
	output += "\n" + Installed_Software_Versions({"help":help, "json":json});
	output += "\n" + Local_Account_File({"help":help, "json":json});
	output += "\n" + Unique_Bash_History_Sessions({"help":help, "json":json});
	output += "\n" + SSH_Keys({"help":help, "json":json});
	output += "\n" + Read_Local_Group_Lists({"help":help, "json":json});
	output += "\n" + Slack_Download_Cache_History({"help":help, "json":json});
	output += "\n" + Slack_Team_Information({"help":help, "json":json});
	output += "\n" + Recent_Files({"help":help, "json":json});
	output += "\n" + Firewall({"help":help, "json":json});
	output += "\n" + Airport_Preferences({"help":help, "json":json});
	output += "\n" + SMB_Server({"help":help, "json":json});
	output += "\n" + WiFi_Messages({"help":help, "json":json});
	output += "\n" + Network_Interfaces({"help":help, "json":json});
	output += "\n" + Bluetooth_Connections({"help":help, "json":json});
	output += "\n" + OS_Version({"help":help, "json":json});
	output += "\n" + Krb5_AD_Config({"help": help, "json":json});
	output += "\n" + Krb5_AD_Logging({"help": help, "json":json});
	output += "\n" + PaloaltoGlobalProtect({"help": help, "json":json});
	output += "\n" + Forcepoint_DLP_Information({"help": help, "json":json});
	return output;
}
function User_Preferences({help=false, json=false} = {}){
	let output = "";
	output += "\n" + Persistent_Dock_Apps({"help":help, "json":json});
	output += "\n" + Spaces_Check({"help":help, "json":json});
	output += "\n" + Get_Office_Email({"help":help, "json":json});
	output += "\n" + Saved_Printers({"help":help, "json":json});
	output += "\n" + Finder_Preferences({"help":help, "json":json});
	output += "\n" + Launch_Services({"help":help, "json":json});
	output += "\n" + Universal_Access_Auth_Warning({"help":help, "json":json});
	output += "\n" + Relaunch_At_Login({"help":help, "json":json});
	output += "\n" + Global_Preferences({"help":help, "json":json});
	output += "\n" + OS_Version({"help":help, "json":json});
	output += "\n" + Installed_Software_Versions({"help":help, "json":json});
	output += "\n" + User_Launchagents({"help":help, "json":json});
	output += "\n" + User_Launchdaemons({"help":help, "json":json});
	output += "\n" + Slack_Download_Cache_History({"help":help, "json":json});
	output += "\n" + Slack_Team_Information({"help":help, "json":json});
	return output;
}
function Global_Preferences({help=false, json=false} = {}){
	let output = "";
	output += "\n" + Firewall({"help":help, "json":json});
	output += "\n" + Airport_Preferences({"help":help, "json":json});
	output += "\n" + SMB_Server({"help":help, "json":json});
	output += "\n" + WiFi_Messages({"help":help, "json":json});
	output += "\n" + Network_Interfaces({"help":help, "json":json});
	output += "\n" + Bluetooth_Connections({"help":help, "json":json});
	output += "\n" + Krb5_AD_Config({"help": help, "json":json});
	output += "\n" + Krb5_AD_Logging({"help": help, "json":json});
	output += "\n" + PaloaltoGlobalProtect({"help": help, "json":json});
	output += "\n" + Forcepoint_DLP_Information({"help": help, "json":json});
	return output;
}
