# LizMap Tool

## Tools
  - [Measure tool](#measure-tool)
  - [Swipe tool](#swipe-tool) 
  - [Volume tool](#volume-measurement-tool)
  - [Goto tool](#goto-tool)
  - [Elevation tool](#elevation-tool)
## Measure tool
  ### Prerequisites
  - Before adding [Measurement Tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Measurement_Tool.js) to your project, activate the `Measure` tool in `Qgis Lizmap plugin`.
  - then add [Measurement Tool](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Measurement_Tool.js) file to the `media/js` folder.
  ### Use
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

  ### Use
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
  Add the [VolumeMeasure.js](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/VolumeMeasure.js) file in the `media/js` folder.
  ### Use
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
  
## Goto tool
  ### Prerequisites
  Add [Goto_tool.js](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Goto_tool.js) file in `media/js` folder.

  ### Use
  
  ![Find Goto icon](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/goto/goto_icon.png)

  Click on the goto icon to `open/close` the goto dock.

  ![Select Uint](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/goto/select_unit.png)

  Select the unit from the dropdown.

  ![Enter co-ordinate](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/goto/enter_coordinate.png)

  Please input the exact coordinates of the point you wish to add.

  ![add point](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/goto/add_point.png)

  Add Point to the map.

  ![](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/goto/export_points.png)

  Export points as a `.kml` file.
  
## Elevation tool
  ### Prerequisites
  There must be at least one Popup-enabled DSM or DTM layer. You can enable `popup` for a layer in `Qgis Lizmap plugin`.
  Add the [ElevationViewerTool.js](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/ElevationViewerTool.js) file in the `media/js` folder.

  ### Use
  ![Find the elevation icon](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Elevation%20tool/icon.png)

  Locate the `Elevation` tool icon and click on that to `open/close` the elevation tool dock.

  ![Accuracy control](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Elevation%20tool/Accuracy.png)

  You can adjust the accuracy by inputting the number of points or distance between them.

  ![Input line(s)](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Elevation%20tool/input.png)
  Select a DSM or DTM layer with pop-ups from the dropdown. `Input` line(s) by drawing or uploading a `.kml` file.
  To draw a line, click on two points.
  Please ensure that the line(s) provided as input are completely within the selected layer.

  ![output](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Elevation%20tool/result.png)

  After selecting the DSM or DTM layer and inputting the line(s), the Elevation tool will generate the result.

  ![Toggle graph](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Elevation%20tool/toggleSlopeElevation.png)

  You can toggle between the `slope` and `elevation` graphs by clicking on the rectangles located at the top of the graph.

  ![Export](https://github.com/dp-sahu88/ODISHA_MCL/blob/main/Images/Elevation%20tool/Export.png)

  Export the graph in `CSV` or `JPEG` format.
  
