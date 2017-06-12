function helloWorldAction() {
    console.log(gc.PluginUI);
}

Draw.loadPlugin(function(ui) {
    var gc = window || {};
    gc.PluginUI = ui;
    console.log(gc.PluginUI);

    // Adds menu
    ui.menubar.addMenu('Hello, World Menu', function(menu, parent) {
        ui.menus.addMenuItem(menu, 'helloWorldAction');
    });

    // Reorders menubar
    ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
    ui.menubar.container.lastChild.previousSibling.previousSibling);

    // Displays status message
    ui.editor.setStatus('Hello, World!');

});