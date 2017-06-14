// IBM Cloud Provider Plugin
Draw.loadPlugin(function(ui) {
    // Add icons to the sidbar
    ui.sidebar.addPalette('ibmcloud', 'IBM Cloud', true, function(content) {
        // content.appendChild(ui.sidebar.createVertexTemplate(style, width, height));
        // Sidebar.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle, allowCellsInserted)

        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.virtualserver;image=http://davetropeano.com/images/virtual-server.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Virtual Server', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.vlan;image=http://davetropeano.com/images/vlan.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'VLAN', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.whisk;image=http://davetropeano.com/images/whisk.svg;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Whisk', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.objectstorage;image=http://davetropeano.com/images/object-storage.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Object Storage', true, true));
    });

    // Collapses default sidebar entry and inserts this before
    var c = ui.sidebar.container;
    c.firstChild.click();
    c.insertBefore(c.lastChild, c.firstChild);
    c.insertBefore(c.lastChild, c.firstChild);

    // STEP 0: function level & window level global
	var graph = ui.editor.graph;
    window.graph = ui.editor.graph;

	function generateTemplate() {
		var resources = [];
		var cells = graph.model.cells;
		for (var key in cells) {
			if (cells.hasOwnProperty(key)) {
				var s = cells[key].getStyle();
				if (s) {
					var res = s.match(/ibmcloud.*;/g);
					if (res.length) {
						resources.push(res[0]);
					}
				}
			}
		}

		return JSON.stringify(res);
	}
    // STEP 1: Create a textarea to hold the rendered text
	var div = document.createElement('div');
	div.style.userSelect = 'none';
	div.style.overflow = 'hidden';
	div.style.padding = '10px';
	div.style.height = '100%';

	var tfTemplate = document.createElement('textarea');
	tfTemplate.style.height = '200px';
	tfTemplate.style.width = '100%';
  	tfTemplate.value = '';
	mxUtils.br(div);
	div.appendChild(tfTemplate);
	
	// Extends Extras menu
	mxResources.parse('ibmcloud=IBM Cloud Schematics Template');

	var wnd = new mxWindow(mxResources.get('ibmcloud'), div, document.body.offsetWidth - 480, 140, 320, 300, true, true);
	wnd.destroyOnClose = false;
	wnd.setMaximizable(false);
	wnd.setResizable(false);
	wnd.setClosable(true);

	var btn = mxUtils.button(mxResources.get('cancel'), function() {
		wnd.setVisible(false);
	});
	
	btn.style.marginTop = '8px';
	btn.style.marginRight = '4px';
	btn.style.padding = '4px';
	div.appendChild(btn);

    // Adds action
    ui.actions.addAction('ibmcloud', function()
    {
		wnd.setVisible(!wnd.isVisible());
		
		if (wnd.isVisible()) {
			tfTemplate.value = generateTemplate();
			tfTemplate.focus();	
		}
    });
	
	var theMenu = ui.menus.get('extras');
	var oldMenu = theMenu.funct;
	
	theMenu.funct = function(menu, parent)
	{
		oldMenu.apply(this, arguments);
		ui.menus.addMenuItems(menu, ['ibmcloud'], parent);
	};
});