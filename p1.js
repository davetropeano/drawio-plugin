/**
 * Sample plugin.
 */
Draw.loadPlugin(function(ui) {
    // Adds custom sidebar entry
    ui.sidebar.addPalette('ibmcloud', 'IBM Cloud', true, function(content) {

        // content.appendChild(ui.sidebar.createVertexTemplate(style, width, height));
        // Sidebar.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle, allowCellsInserted)

        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.virtualserver;image=https://github.com/davetropeano/drawio-plugin/raw/master/images/virtual-server.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Virtual Server', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.vlan;image=https://github.com/davetropeano/drawio-plugin/raw/master/images/vlan.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'VLAN', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.whisk;image=https://github.com/davetropeano/drawio-plugin/raw/master/images/whisk.svg;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Whisk', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.objectstorage;image=https://github.com/davetropeano/drawio-plugin/raw/master/images/object-storage.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Object Storage', true, true));
    });

    // Collapses default sidebar entry and inserts this before
    var c = ui.sidebar.container;
    c.firstChild.click();
    c.insertBefore(c.lastChild, c.firstChild);
    c.insertBefore(c.lastChild, c.firstChild);

    // Adds logo to footer
    ui.footerContainer.innerHTML = '<img width=50px height=17px align="right" style="margin-top:14px;margin-right:12px;" ' + 'src="http://download.esolia.net.s3.amazonaws.com/img/eSolia-Logo-Color.svg"/>';

	// Adds variables in labels (%today, %filename%)
	var superGetLabel = ui.editor.graph.getLabel;
	
	ui.editor.graph.getLabel = function(cell)
	{
		var result = superGetLabel.apply(this, arguments);
		
		if (result != null)
		{
			var today = new Date().toLocaleString();
			var file = ui.getCurrentFile();
			var filename = (file != null && file.getTitle() != null) ? file.getTitle() : '';
			
			result = result.replace('%today%', today).replace('%filename%', filename);
		}
		
		return result;
	};
    
//    // Adds resource for action
//    mxResources.parse('helloWorldAction=Hello, World!');
//
//    // Adds action
//    ui.actions.addAction('helloWorldAction', function() {
//        var ran = Math.floor((Math.random() * 100) + 1);
//        mxUtils.alert('A random number is ' + ran);
//    });
//
//    // Adds menu
//    ui.menubar.addMenu('Hello, World Menu', function(menu, parent) {
//        ui.menus.addMenuItem(menu, 'helloWorldAction');
//    });
//
//    // Reorders menubar
//    ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
//        ui.menubar.container.lastChild.previousSibling.previousSibling);
//
//    // Adds toolbar button
//    ui.toolbar.addSeparator();
//    var elt = ui.toolbar.addItem('', 'helloWorldAction');
//
//    // Cannot use built-in sprites
//    elt.firstChild.style.backgroundImage = 'url(https://www.draw.io/images/logo-small.gif)';
//    elt.firstChild.style.backgroundPosition = '2px 3px';
});