//Author Cody Thomas, @its_a_feature_
//All of these functions use Objective C API calls to read PLIST files or normal from an unauthenticated context
//Helper Functions -----------------------------------
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
//-------------------------------------------------
function Persistent_Dock_Apps({help=false} = {}){
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
	output = "**************************************\n" + "**** Persistent Dock Applications ****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Spaces_Check({help=false} = {}){
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
	output = "**************************************\n" + "******** Desktops Information ********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Get_Office_Email({help=false} = {}){
	var fileManager = $.NSFileManager.defaultManager;
	var currentUserPath = fileManager.homeDirectoryForCurrentUser.fileSystemRepresentation;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(currentUserPath + "/Library/Preferences/com.microsoft.office.plist");
	var contents = ObjC.deepUnwrap(dict);
	var output = {};
	if(contents != {} && contents != undefined){
		output['email'] = contents['OfficeActivationEmailAddress'];
		output = "**************************************\n" + "****** Registered Office Email ******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}
	return output;}
function Saved_Printers({help=false} = {}){
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
		output = "**************************************\n" + "********* Last Used Printers *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}	
	return output;}
function Finder_Preferences({help=false} = {}){
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
	
	output = "**************************************\n" + "** Recent Folders and Finder Prefs **\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Launch_Services({help=false} = {}){
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
	output = "**************************************\n" + "*** Custom LaunchServices Handlers ***\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Universal_Access_Auth_Warning({help=false} = {}){
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
	output = "**************************************\n" + "**** UniversalAccess Auth Warning ****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Relaunch_At_Login({help=false} = {}){
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
	output = "**************************************\n" + "* Applications to Relaunch at Login *\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function LoginItems({help=false} = {}){
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
		output['LoginItems'] = contents;
	}
	output = "**************************************\n" + "************ Login Items ************\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function User_Dir_Hidden_Files_Folders({help=false} = {}){
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
	output = "**************************************\n" + "***** Hidden Files/Folders in ~ *****\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function User_Global_Preferences({help=false} = {}){
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
	output = "**************************************\n" + "***** User's Global Preferences *****\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function User_Launchagents({help=false} = {}){
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
		output[files[i]] = dict;
		
	}
	output = "**************************************\n" + "***** User's Launch Agents *****\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function User_Launchdaemons({help=false} = {}){
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
		output[files[i]] = dict;
		
	}
	output = "**************************************\n" + "***** User's Launch Daemons *****\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function Installed_Software_Versions({help=false} = {}){
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
	output = "**************************************\n" + "********** Software Verions  *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Local_Account_File({help=false} = {}){
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
	output = "**************************************\n" + "******** Local .account File  ********\n" + "**************************************\n" + JSON.stringify(contents, null , 1);
	return output;}
// ----------- user data mining functions -------------
function Unique_Bash_History_Sessions({help=false} = {}){
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
	output = "**************************************\n" + "******* Unique Bash History *******\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function SSH_Keys({help=false} = {}){
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
	output = "**************************************\n" + "********* SSH Key Files *********\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function Read_Local_Group_Lists({help=false} = {}){
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
	output = "**************************************\n" + "********* Local Groups *********\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function Slack_Download_Cache_History({help=false} = {}){
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
	output = "**************************************\n" + "********* Slack Downloads *********\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function Slack_Team_Information({help=false} = {}){
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
	output = "**************************************\n" + "********* Slack Team Info *********\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
function Recent_Files({help=false} = {}){
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
	output = "**************************************\n" + "***** User's recent applications *****\n" + "**************************************\n" + JSON.stringify(output, null , 2);
	return output;}
//------------ globally readable plists with interesting info ------------------
function Firewall({help=false} = {}){
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
	output = "**************************************\n" + "******* Firewall Preferences *******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Airport_Preferences({help=false} = {}){
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
	output = "**************************************\n" + "******** Airport Preferences ********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function SMB_Server({help=false} = {}){
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
	output = "**************************************\n" + "******* SMB Server Preferences *******\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function WiFi_Messages({help=false} = {}){
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
		output = "**************************************\n" + "********* WiFi Associations *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	}
	return output;}
function Network_Interfaces({help=false} = {}){
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

	output = "**************************************\n" + "********* Network Interfaces *********\n" + "**************************************\n" + JSON.stringify(output, null , 1);
	return output;}
function Bluetooth_Connections({help=false} = {}){
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
		output = "**************************************\n" + "******* Bluetooth Connections *******\n" + "**************************************\n" + "Convert Class of Device with: http://domoticx.com/bluetooth-class-of-device-list-cod/\n" + JSON.stringify(output, null , 1);
	}	
	return output;}
function OS_Version({help=false} = {}){
	if(help){
	    var output = "";
		return output;
	}
	var output = {};
	var fileManager = $.NSFileManager.defaultManager;
	var dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/System/Library/CoreServices/SystemVersion.plist");
	var contents = ObjC.deepUnwrap(dict);
	output = "**************************************\n" + "********** OS Version Info  **********\n" + "**************************************\n" + JSON.stringify(contents, null , 1);
	return output;}
//---------------------------------------------------------
function All_Checks({help=false} = {}){
	output = "";
	output += "\n" + Persistent_Dock_Apps();
	output += "\n" + Spaces_Check();
	output += "\n" + Get_Office_Email();
	output += "\n" + Saved_Printers();
	output += "\n" + Finder_Preferences();
	output += "\n" + Launch_Services();
	output += "\n" + Universal_Access_Auth_Warning();
	output += "\n" + Relaunch_At_Login();
	output += "\n" + LoginItems();
	output += "\n" + User_Dir_Hidden_Files_Folders();
	output += "\n" + User_Global_Preferences();
	output += "\n" + User_Launchagents();
	output += "\n" + User_Launchdaemons();
	output += "\n" + Installed_Software_Versions();
	output += "\n" + Local_Account_File();
	output += "\n" + Unique_Bash_History_Sessions();
	output += "\n" + SSH_Keys();
	output += "\n" + Read_Local_Group_Lists();
	output += "\n" + Slack_Download_Cache_History();
	output += "\n" + Slack_Team_Information();
	output += "\n" + Recent_Files();
	output += "\n" + Firewall();
	output += "\n" + Airport_Preferences();
	output += "\n" + SMB_Server();
	output += "\n" + WiFi_Messages();
	output += "\n" + Network_Interfaces();
	output += "\n" + Bluetooth_Connections();
	output += "\n" + OS_Version();
	return output;
}
function User_Preferences(){
	output = "";
	output += "\n" + Persistent_Dock_Apps();
	output += "\n" + Spaces_Check();
	output += "\n" + Get_Office_Email();
	output += "\n" + Saved_Printers();
	output += "\n" + Finder_Preferences();
	output += "\n" + Launch_Services();
	output += "\n" + Universal_Access_Auth_Warning();
	output += "\n" + Relaunch_At_Login();
	output += "\n" + Global_Preferences();
	output += "\n" + OS_Version();
	output += "\n" + Installed_Software_Versions();
	output += "\n" + User_Launchagents();
	output += "\n" + User_Launchdaemons();
	output += "\n" + Slack_Download_Cache_History();
	output += "\n" + Slack_Team_Information();
	return output;
}
function Global_Preferences({help=false} = {}){
	output = "";
	output += Firewall();
	output += Airport_Preferences();
	output += SMB_Server();
	output += WiFi_Messages();
	output += Network_Interfaces();
	output += Bluetooth_Connections();
	return output;
}
