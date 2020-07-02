# HealthInspector
JXA situational awareness helper by simply reading specific files on a filesystem

## Purpose
Health Inspector is designed to help provide some additional situation awareness for operations on macOS by doing a lot of discovery by simply reading PLIST files or other files on disk that any user can read. I wanted to find another way to do discovery in JXA and macOS in general without having to spawn a bunch of bash commands.

## Execution
To run the functions within HealthInspector with Apfell, use the `jsimport` and `jsimport_call` functions within the `apfell-jxa` payload. When you run `jsimport_call` be sure to specify the function you want to execute afterwards, such as: `jsimport_call All_Checks()`. 

If you want to execute this outside of an Apfell apfell-jxa payload, you can execute it with osascript:
`osascript HealthInspector.js`. You will need to append to the bottom of the script the function you want to call though. The script itself is just a list of functions.

## Current Functions

The current list of functions and associated files is below:


| Function | Description | Plist|
| ---------|:------------------|:--------|
| Persistent_Dock_Apps | List what applications are persistently docked (including folders) |  ~/Library/Preferences/com.apple.dock.plist| 
| Spaces_Check | How many desktops are there for the user and which one is currently active |  ~/Library/Preferences/com.apple.spaces.plist| 
| Get_Office_Email | Get the user's office activation email |  ~/Library/Preferences/com.microsoft.office.plist| 
| Saved_Printers | Get information about printers (name and IP) |  ~/Library/Preferences/org.cups.PrintingPrefs.plist| 
| Finder_Preferences | Recent folders, show hidden files, recent move/copy destination, GoTo destinations, prior mounted volumes, etc | ~/Library/Preferences/com.apple.finder.plist| 
| Launch_Services | Mappings of programs to URL schemas and programs to file extensions | ~/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist| 
| Universal_Access_Auth_Warning | List of programs that have caused a universal access prompt | ~/Library/Preferences/com.apple.universalaccessAuthWarning.plist| 
| Relaunch_At_Login | Applications that are open now and will potentially be re-opened after reboot | ~/Library/Preferences/ByHost/*.com.apple.loginwindow.plist | 
| LoginItems | Login Items | ~/Library/Preferences/com.apple.loginitems.plist| 
| User_Dir_Hidden_Files_Folders | Look for all hidden files and folders in the user's home directory | ~/ | 
| User_Global_Preferences |Show all extensions, finder extensions, recent places, and default browser |~/Library/Preferences/.GlobalPreferences.plist | 
| User_Launchagents | Information about the user's launch agents | ~/Library/LaunchAgents/* | 
| User_Launchdaemons | Information about the user's launch daemons|  ~/Library/LaunchDaemons/*| 
| Installed_Software_Versions | Installed software versions, install date, and process name |/Library/Receipts/InstallHistory.plist | 
| Local_Account_File | |~/.account | 
| Unique_Bash_History_Sessions | Reads all these files into a Set (which removes duplicates) and returns a list of all unique commands run | ~/.bash_sessions/*, ~/.bash_history | 
| SSH_Keys | Dump of all files in this folder |~/.ssh/* | 
| Read_Local_Group_Lists | Reads all the groups and their members |/private/etc/group | 
| Slack_Download_Cache_History | List out all Slack downloads and where they were saved to |~/Library/Application Support/Slack/storage/slack-downloads | 
| Slack_Team_Information | Dump out information saved about all teams the user has saved |~/Library/Application Support/Slack/storage/slack-teams | 
| Recent_Files | List of 10 most recent applications accessed by the user | ~/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.RecentApplications.sfl2| 
| Firewall | List out exempted programs, explicitly authed programs, and the state of certain firewall groups |/Library/Preferences/com.apple.alf.plist | 
| Airport_Preferences | Details about all WiFi networks you've connected to and which other ones were nearby that you also connected to | /Library/Preferences/SystemConfiguration/com.apple.airport.preferences.plist| 
| SMB_Server | Kerberos Realm, NetBios name, Host description| /Library/Preferences/SystemConfiguration/com.apple.smb.server.plist| 
| WiFi_Messages | List of WiFi association SSIDs | /Library/Preferences/SystemConfiguration/com.apple.wifi.message-tracer.plist| 
| Network_Interfaces | List of basic network interfaces, active, type, and user information | /Library/Preferences/SystemConfiguration/NetworkInterfaces.plist| 
| Bluetooth_Connections | List of bluetooth connections, when they last connected, and what class of item/name |/Library/Preferences/com.apple.Bluetooth.plist | 
| Jamf_Information | List of Jamf configuration details and Azure information (if applicable) |/Library/Preferences/com.jamfsoftware.jamf.plist | 
| OS_Version | Software build version, name, and normal version | /System/Library/CoreServices/SystemVersion.plist|
| All_Checks | Do all of the above checks | |
| User_Preferences | Do all checks related to the user specifically | |
| Global_Preferences | Do all checks related to global preferences that don't fall in ~/ | |

## Contributing
Please open pull requests for new files you find to parse that provide useful information. If possible, please also include the file (or example of the file) if it's not a default Apple plist
