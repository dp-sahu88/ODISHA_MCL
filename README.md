# LizMap Tool

## Tools
  - [Measure tool](#measure-tool)
  - [Swipe tool](#swipe-tool) 
  - [Volume tool](#volume-measurement-tool) 
## Measure tool
  ### Prerequisites
  - Before adding [Measurement Tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Measurement_Tool.js) to your project, activate the `Measure` tool in `Qgis Lizmap plugin`.
  - then add [Measurement Tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Measurement_Tool.js) file to the `media/js` folder.
  ### Uses
  ![Find the Measure tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Measurement%20Tool/Measuretoolicon.JPG)

  You can find the Measure tool icon in the toolbar, click that icon to open the Measure tool dock.
  
  ![Select the measurement type and the unit in the measure tool dock](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Measurement%20Tool/measuretoolDock.JPG)

  Now you can select the measurement `type` and `unit` from the dock.

  ![Select Length as the measurement type](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Measurement%20Tool/length.JPG)

  Select Length as the measurement type to measure the length, you can also change the unit to `miles, kilometers, meters, feet or inches`.
  Then you can draw a line to measure the length between two points.

  ![Select Area as the measurement type](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Measurement%20Tool/area.JPG)

  Select Area as the measurement type to measure the area of a closed polygon, you can also change the unit to `mi², km², m², ft², yd² or Acres`.
  Then you can draw a closed polygon to measure the area.
  
  ![Select Perimeter as measurement type](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Measurement%20Tool/perim.JPG)

  Select Perimeter as the measurement type to measure the perimeter of the closed polygon, you can also change the unit to `miles, kilometers, meters, feet, or inches`. 
  Then you can draw a closed polygon to measure the Perimeter.

  ![Find the Measure tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Measurement%20Tool/Measuretoolicon.JPG)

  You can find the Measure tool icon in the toolbar, click that icon to close the Measure tool dock.
## Swipe tool
  ### Prerequisites
  Add the [Swipe tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Swipe.js) file to the `media/js` folder in your project directory.

  ### Uses
  ![Find the Swipe tool icon in the tool bar](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Swipe%20Tool/SwipeIcon.jpg)

  You can locate the Swipe tool icon in the left toolbar of the page, you can click that icon to activate the Swipe tool.

  ![Swipe tool dock](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Swipe%20Tool/swipe_dock.png)

  you can select the `layer` and the `direction` from the `Swipe tool` dock. 

  ![drag input](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Swipe%20Tool/dragInput.png)

  You can swipe the selected layer by dragging the meter input at the bottom of the page.

  ![Find the Swipe tool icon in the tool bar](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Swipe%20Tool/SwipeIcon.jpg)

  You can locate the Swipe tool icon in the left toolbar of the page, you can click that icon to deactivate the Swipe tool.
## Volume measurement tool
  ### Prerequisites
  There must be at least one Popup-enabled DSM or DTM layer. You can enable `popup` for a layer in `Qgis Lizmap plugin`.
  Add the [VolumeMeasure.js](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/VolumeMeasure.js) file in the `media/js`folder.
  ### Uses
  ![Locate volume tool icon](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/volumeToolIcon.png)

  Locate the Volume tool icon and click to `open/close` the Volume measurement dock.

  ![Select DSM or DTM Layer](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/select_layer.png)

  Now you can select a DSM or DTM layer in which popup is enabled.

  ![Accuracy control](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/accuracy_controll.png)

  Higher accuracy will take more time and resources.
  
  ![Base elevation](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/base_elevetion.png)

  You can also specify the base elevation, if the base elevation is not specified then it will automatically calculate the base elevation.
  
  ![Draw polygon](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/startDraw.png)
  ![import polygon](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/import_file.png)
  
  To start drawing a polygon, click on the pencil icon. If you want to clear the drawn polygon, you can use the same button with the pencil icon. Alternatively, you can import a polygon from a `.kml` file. Once you have imported or drawn the polygon, processing will      start immediately. It's important to ensure that the polygon is completely inside the selected DSM/DTM layer.

  ![Result](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/result.png)

  After loading and processing you will get the output.

  ![Export](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Volume%20tool/export.png)

  Export results in `.csv`  file.
  

  
  
  
