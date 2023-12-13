# Meisunry
A minimalist, offline masonry image viewer.

Masonry layouts are super common all over the web from websites like <a href="https://pinterest.com/">Pinterest</a>, <a href="https://www.artstation.com/">ArtStation</a>, or <a href="https://deviantart.com">DeviantArt</a>. In terms of offline masonry viewers, the options are more limited. There are some programs like <a href="https://apps.microsoft.com/store/detail/123-photos-view-edit-convert/9WZDNCRDXFXG?hl=en-us&gl=us&rtc=1">123 Photos</a> and <a href="https://apps.microsoft.com/store/detail/microsoft-photos/9WZDNCRFJBH4">Microsoft Photos</a>. However, I've found both of these solutions to have a bit too much in the way.

This is where <b>Meisunry</b> comes in. Choose a folder and look at your images without any unnecessary details.

![Demo](/app-icons/demo.gif)

## Controls

<b>Left click:</b> Make target image fullscreen <br>
<b>Right click:</b> Sorting options, recursion depth, and folder selection<br>
<b>Ctrl + Mouse wheel:</b> Zoom in/out<br>
<b>Shift + Mouse wheel:</b> Padding control<br>

## Adding Meisunry to file explorer context menu

> [!CAUTION]
> Editing the registry can be dangerous if you don't know what you're doing. I would not recommend following this section if you are not comfortable with registry editing. 

> [!NOTE]
> The following has only been tested on Windows 10. I cannot guarantee that future or past versions of Windows will also work properly. (Although I assume it shouldn't be an issue.)

First, find the location for each directory you would like to add the context menu actions.

| Type | Location |
| :---: | :---: |
| <b>All files context menu</b> | Computer\HKEY_CLASSES_ROOT\\*\shell |
| <b>No selection context menu</b> | Computer\HKEY_CLASSES_ROOT\Directory\Background\shell |
| <b>Folder selected context menu</b> | Computer\HKEY_CLASSES_ROOT\Directory\shell |

Under each `shell` folder, right-click to create a new key called `Meisunry`. And under that key, create another key called `command`. It should appear like in the images below.

Now that the keys are created, you can set up the action itself. 

### Meisunry Key

In the `Meisunry` key, right click to create a new `String Value` with the name of `Icon`. The data for this should be set to the directory of your Meisunry installation as shown below. The (Default) string value data is for the preview text in the context menu. I'd recommend "Open with Meisunry."

![Demo](/app-icons/MeisunryKey.png)

### command Key

In the `command` key, for the default string value, the value should be...<br> 
```
"{MeisunryInstallation}" "%V"
```
The %V will capture the directory you are targeting, so it is very important.

![Demo](/app-icons/commandKey.png)

If you did everything correctly, right-clicking in File Explorer or on the Desktop will show this option in your context menu!

![Demo](/app-icons/Success.png)

