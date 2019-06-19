//Author Cody Thomas, @its_a_feature_
//All of these functions use Objective C API calls to read PLIST files from an unauthenticated context
//Helper Functions -----------------------------------
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
function get_permissions(path){
	var fileManager = $.NSFileManager.defaultManager;
	attributes = ObjC.deepUnwrap(fileManager.attributesOfItemAtPathError($(path), $()));
    var trimmed_attributes = {};
    trimmed_attributes['NSFileOwnerAccountID'] = attributes['NSFileOwnerAccountID'];
    trimmed_attributes['NSFileExtensionHidden'] = attributes['NSFileExtensionHidden'];
    trimmed_attributes['NSFileGroupOwnerAccountID'] = attributes['NSFileGroupOwnerAccountID'];
    trimmed_attributes['NSFileOwnerAccountName'] = attributes['NSFileOwnerAccountName'];
    trimmed_attributes['NSFileCreationDate'] = attributes['NSFileCreationDate'];
    var nsposix = attributes['NSFilePosixPermissions'];
    // we need to fix this mess to actually be real permission bits that make sense
    var posix = ((nsposix >> 6) & 0x7).toString() + ((nsposix >> 3) & 0x7).toString() + (nsposix & 0x7).toString();
    trimmed_attributes['NSFilePosixPermissions'] = posix;
    trimmed_attributes['NSFileGroupOwnerAccountName'] = attributes['NSFileGroupOwnerAccountName'];
    trimmed_attributes['NSFileModificationDate'] = attributes['NSFileModificationDate'];
    return trimmed_attributes;
}
//-------------------------------------------------
function Persistent_Dock_Apps({help=false, json=false} = {}){
	if(help){
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.dock.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['persistent-dock-apps'] = [];
	for(var i = 0; i < contents['persistent-apps'].length; i++){
		output['persistent-dock-apps'].push({"label": contents['persistent-apps'][i]['tile-data']['file-label'],
											 "bundle": contents['persistent-apps'][i]['tile-data']['bundle-identifier']});
	}
	for(var i = 0; i < contents['persistent-others'].length; i++){
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
		var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.spaces.plist");
	var contents = ObjC.deepUnwrap(dict);
	var monitors = contents['SpacesDisplayConfiguration']['Management Data']['Monitors'];
	for(var i = 0; i < monitors.length; i++){
		if(monitors[i]['Display Identifier'] == "Main"){
			var currentSpaceID = monitors[i]['Current Space']['ManagedSpaceID'];
			var currentSpacePlace = 0;
			var totalSpaces = monitors[i]['Spaces'].length;
			for(var j = 0; j < monitors[i]['Spaces'].length; j++){
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
		var output = "";
		return output;
	}
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.microsoft.office.plist");
	var contents = ObjC.deepUnwrap(dict);
	var output = {};
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/org.cups.PrintingPrefs.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['LastUsedPrinters'] = [];
	if(contents != undefined){
		for(var i = 0; i < contents['LastUsedPrinters'].length; i++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.finder.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['Recent Move and Copy Destinations'] = contents['RecentMoveAndCopyDestinations'];
	output['Finder GoTo Folder Recents'] = contents['GoToFieldHistory'];
	output['Show All Files in Finder'] = contents['AppleShowAllFiles'];
	output['Show Removable Media on Desktop'] = contents['ShowRemovableMediaOnDesktop'];
	output['Tag Names'] = contents['FavoriteTagNames'];
	output['Recent Folders'] = [];
	for(var i = 0; i < contents['FXRecentFolders'].length; i++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['LSHandlers_FileExtensions'] = [];
	output['LSHandlers_URLSchemes'] = [];
	if(contents != undefined){
		for(var i = 0; i < contents['LSHandlers'].length; i++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.universalaccessAuthWarning.plist");
	var contents = ObjC.deepUnwrap(dict);
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/Library/Preferences/ByHost", Ref()));
	output['Relaunch Apps'] = [];
	for(i in files){
		if(files[i].includes("com.apple.loginwindow") && files[i].endsWith(".plist")){
			var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/ByHost/" + files[i]);
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.apple.loginitems.plist");
	var contents = ObjC.deepUnwrap(dict);
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
	    var output = "";
		return output;
	}
	var output = [];
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath, Ref()));
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/.GlobalPreferences.plist");
	var contents = ObjC.deepUnwrap(dict);
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/Library/LaunchAgents/", Ref()));
	for(i in files){
		var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/LaunchAgents/" + files[i]);
		dict = ObjC.deepUnwrap(dict);
		if(dict != undefined && dict.hasOwnProperty('ProgramArguments')){
            dict['Program Attributes'] = get_permissions(dict['ProgramArguments'][0]);
            program_dir = dict['ProgramArguments'][0].split("/");
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/Library/LaunchDaemons/", Ref()));
	for(i in files){
		var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/LauncDaemons/" + files[i]);
		dict = ObjC.deepUnwrap(dict);
		if(dict != undefined && dict.hasOwnProperty('ProgramArguments')){
            dict['Program Attributes'] = get_permissions(dict['ProgramArguments'][0]);
            program_dir = dict['ProgramArguments'][0].split("/");
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
	    var output = "";
		return output;
	}
	var output = {};
	var dict = $.NSArray.alloc.initWithContentsOfFile("/Library/Receipts/InstallHistory.plist");
	var contents = ObjC.deepUnwrap(dict);
	for(var i in contents){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/.account");
	var contents = ObjC.deepUnwrap(dict);
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/.bash_sessions/", Ref()));
	var final_commands = new Set();
	for(i in files){
		var list = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/.bash_sessions/" + files[i], $.NSUTF8StringEncoding, $()).js.split("\n");
		for(var j in list){
			final_commands.add(list[j]);
		}
	}
	var list = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/.bash_history", $.NSUTF8StringEncoding, $()).js;
	if(list != undefined){
		list = list.split("\n");
		for(var j in list){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var files = ObjC.deepUnwrap(fileManager.contentsOfDirectoryAtPathError(currentUserPath + "/.ssh", Ref()));
	for(i in files){
		var dict = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/.ssh/" + files[i], $.NSUTF8StringEncoding, $());
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSString.alloc.initWithContentsOfFileEncodingError("/private/etc/group", $.NSUTF8StringEncoding, $()).js.split("\n");
	var lines = [];
	for(var i in dict){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/Library/Application Support/Slack/storage/slack-downloads", $.NSUTF8StringEncoding, $()).js;
	if(dict != "" && dict != undefined){
		dict = JSON.parse(dict);
		team_keys = Object.keys(dict);
		output['slack download cache history'] = [];
		for(var team_key in team_keys){
			var file_keys = Object.keys(dict[team_keys[team_key]]);
			for(var file_key in file_keys){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSString.alloc.initWithContentsOfFileEncodingError(currentUserPath + "/Library/Application Support/Slack/storage/slack-teams", $.NSUTF8StringEncoding, $()).js;
	if(dict != "" && dict != undefined){
		dict = JSON.parse(dict);
		keys = Object.keys(dict);
		for(var key in keys){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	output['Recent Applications'] = [];
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.RecentApplications.sfl2");
	var contents = ObjC.deepUnwrap(dict);
	for(var i = 0; i < contents['$objects'].length; i++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.apple.alf.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['Exceptions'] = [];
	for(var i = 0; i < contents['exceptions'].length; i++){
		if(contents['exceptions'][i].hasOwnProperty('bundleid')){
			var item = {};
			item['path'] = contents['exceptions'][i]['path'];
			item['bundleID'] = contents['exceptions'][i]['bundleid'];
			output['Exceptions'].push(item);
		}
		else{
			output['Exceptions'].push(contents['exceptions'][i]['path']);
		}
	}
	output['Explicit Auths'] = [];
	for(var i = 0; i < contents['explicitauths'].length; i++){
		output['Explicit Auths'].push(contents['explicitauths'][i]['id']);
	}
	output['Global State'] = contents['globalstate'];
	firewall_keys = Object.keys(contents['firewall']);
	for(i in firewall_keys){
		var status = contents['firewall'][firewall_keys[i]]['state'];
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/com.apple.airport.preferences.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['Known Networks'] = [];
	var wifi_keys = Object.keys(contents['KnownNetworks']);
	var hex_to_ssid = {};
	for(var i in wifi_keys){
		hex_to_ssid[wifi_keys[i]] = contents['KnownNetworks'][wifi_keys[i]]['SSIDString'];
	}
	for(var i in wifi_keys){
		var SSID = contents['KnownNetworks'][wifi_keys[i]]['SSIDString'];
		var SecurityType = contents['KnownNetworks'][wifi_keys[i]]['SecurityType'];
		var lastConnected = contents['KnownNetworks'][wifi_keys[i]]['LastConnected'];
		var wasCaptive = contents['KnownNetworks'][wifi_keys[i]]['NetworkWasCaptive'];
		var captiveBypass = contents['KnownNetworks'][wifi_keys[i]]['CaptiveBypass'];
		var collocatedGroup = [];
		for(var j = 0; j < contents['KnownNetworks'][wifi_keys[i]]['CollocatedGroup'].length; j++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/com.apple.smb.server.plist");
	var contents = ObjC.deepUnwrap(dict);
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/com.apple.wifi.message-tracer.plist");
	var contents = ObjC.deepUnwrap(dict);
	if(contents != undefined){
		var associationKeys = Object.keys(contents['AssociationSSIDMap']);
		output['Association SSIDs'] = [];
		for(var i in associationKeys){
			var condensed = associationKeys[i].replace(/ /g, '');
			condensed = condensed.substring(1, condensed.length-1)
			output['Association SSIDs'].push(hex2a(condensed));
		}
		var associationKeys = Object.keys(contents['InternalAssociationSSIDMap']);
		output['InternalAssociation SSIDs'] = [];
		for(var i in associationKeys){
			var condensed = associationKeys[i].replace(/ /g, '');
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/SystemConfiguration/NetworkInterfaces.plist");
	var contents = ObjC.deepUnwrap(dict);
	output['Network Interfaces'] = {};
	for(var i = 0; i < contents['Interfaces'].length; i++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.apple.Bluetooth.plist");
	var contents = ObjC.deepUnwrap(dict);
	if(contents != undefined && contents.hasOwnProperty('DeviceCache')){
		var Bluetooth_Keys = Object.keys(contents['DeviceCache']);
		var string_to_name = {};
		for(var i in Bluetooth_Keys){
			string_to_name[Bluetooth_Keys[i]] = contents['DeviceCache'][Bluetooth_Keys[i]]['Name'];
		}
		output['Device Cache'] = [];
		for(var i in Bluetooth_Keys){
			if(contents['DeviceCache'][Bluetooth_Keys[i]].hasOwnProperty('ClassOfDevice')){
				var ClassOfDevice = contents['DeviceCache'][Bluetooth_Keys[i]]['ClassOfDevice'].toString(16);
			}
			else{
				var ClassOfDevice = undefined;
			}
			var displayName = contents['DeviceCache'][Bluetooth_Keys[i]]['displayName'];
			var name = contents['DeviceCache'][Bluetooth_Keys[i]]['Name'];
			var lastConnected = contents['DeviceCache'][Bluetooth_Keys[i]]['LastInquiryUpdate'];
			var lastNameUpdate = contents['DeviceCache'][Bluetooth_Keys[i]]['LastNameUpdate'];
			output['Device Cache'].push({"Name": name, "Class of Device": ClassOfDevice, "Last Connected": lastConnected, "Last Updated": lastNameUpdate, "Display Name": displayName})
		}
		output['Currently Paired Devices'] = [];
		for(var i = 0; i < contents['PairedDevices'].length; i++){
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
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/System/Library/CoreServices/SystemVersion.plist");
	var output = ObjC.deepUnwrap(dict);
	if(json==false){
		output = "**************************************\n" + "********** OS Version Info  **********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['HealthInspectorCommand'] = "OS_Version";
		output = JSON.stringify(output, null, 1);
	}
	
	return output;}
//---------------------------------------------------------
function All_Checks({help=false, json=false} = {}){
	output = "";
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
	return output;
}
function User_Preferences({help=false, json=false} = {}){
	output = "";
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
	output = "";
	output += Firewall({"help":help, "json":json});
	output += Airport_Preferences({"help":help, "json":json});
	output += SMB_Server({"help":help, "json":json});
	output += WiFi_Messages({"help":help, "json":json});
	output += Network_Interfaces({"help":help, "json":json});
	output += Bluetooth_Connections({"help":help, "json":json});
	return output;
}
