// IBM Cloud Provider Plugin
Draw.loadPlugin(function(ui) {
    // Add icons to the sidbar
    ui.sidebar.addPalette('ibmcloud', 'IBM Cloud', true, function(content) {
        // content.appendChild(ui.sidebar.createVertexTemplate(style, width, height));
        // Sidebar.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle, allowCellsInserted)

        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.virtualserver;image=http://davetropeano.com/images/virtual-server.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Virtual Server', true, true));
        content.appendChild(ui.sidebar.createVertexTemplate('shape=image;type=ibmcloud.redis;image=http://davetropeano.com/images/redis.png;resizable=1;movable=1;rotatable=0', 100, 100, '', 'Redis', true, true));
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

	function preamble() {
		return `
#############################################################################
# Require terraform 0.9.3 or greater to run this template
#############################################################################
terraform {
	required_version = ">= 0.9.3"
}
#############################################################################
# Provider setup
#############################################################################
	provider "ibmcloud" {
	bluemix_api_key    = "\${var.ibmcloud_bx_api_key}"
	softlayer_username = "\${var.ibmcloud_sl_username}"
	softlayer_api_key  = "\${var.ibmcloud_sl_api_key}"
}
`;
	}

	function cf() {
		return `
#############################################################################
# Get the bluemix cloudfoundry space information for running cf apps
#############################################################################
data "ibmcloud_cf_org" "bx_org" {
  org = "\${var.org}"
}
data "ibmcloud_cf_space" "bx_space" {
  space = "\${var.space}"
  org   = "\${var.org}"
}
data "ibmcloud_cf_account" "bx_account" {
  org_guid = "\${data.ibmcloud_cf_org.bx_org.id}"
}
`;
	}

	function ssh_key() {
		return `
resource "ibmcloud_infra_ssh_key" "ssh_key" {
  label = "sshkey-123"
  notes = ""
  public_key = "\${var.public_key}"
}
`;
	}

	function vm() {
		return `
resource "ibmcloud_infra_virtual_guest" "web_node" {
  count                = "\${var.node_count}"
  hostname             = "test-kelner-node-\${count.index+1}"
  domain               = "test-kelner.com"
  os_reference_code    = "\${var.web_operating_system}"
  datacenter           = "\${var.datacenter}"
  private_network_only = false
  cores                = "\${var.vm_cores}"
  memory               = "\${var.vm_memory}"
  local_disk           = true
  ssh_key_ids = [
    "\${ibmcloud_infra_ssh_key.ssh_key.id}"
  ]
  tags = "\${var.vm_tags}"
}
`;
	}

	function bmx_service(name) {
		var res = `
resource "ibmcloud_cf_service_instance" "NAME" {
  name       = "\${var.NAME_name}"
  space_guid = "\${data.ibmcloud_cf_space.bx_space.id}"
  service    = "\${var.NAME_service}"
  plan       = "\${var.NAME_plan}"
  tags       = [
    "schematics",
    "test"
  ]
}
`;
		return res.replace("NAME", name);
	}

	function vars() {
		return `
#############################################################################
# Variables
#############################################################################
variable "ibmcloud_bx_api_key" {
  description = "Your Bluemix API Key"
  type = "string"
}
variable "ibmcloud_sl_username" {
  description = "Your Softlayer username."
  type = "string"
}
variable "ibmcloud_sl_api_key" {
  description = "Your Softlayer API key."
  type = "string"
}
variable "space" {
  description = "Your Bluemix Space Name."
}
variable "org" {
  description = "Your Bluemix Org Name."
}
variable "datacenter" {
  description = "Your public SSH key."
  default = "dal06"
}
variable "public_key" {
  description = "Your public SSH key."
}
variable "node_count" {
  description = "The number of VM nodes to create."
  default = 1
}
variable "web_operating_system" {
  description = "The number of VM nodes to create."
  default = "UBUNTU_LATEST"
}
variable "vm_cores" {
  description = "The number of cores for the VMs."
  default = 1
}
variable "vm_memory" {
  description = "The amount of memory for the VMs."
  default = 1024
}
variable "vm_tags" {
  description = "The tags to be applied to the VMs."
  default = [
    "kelner",
    "schematics",
    "test"
  ]
}
variable "cloudant_service" {
  description = "The Bluemix CF identifier for cloudant."
  default = "cloudantNoSQLDB"
}
variable "cloudant_plan" {
  description = "The Bluemix CF plan for cloudant."
  default = "Lite"
}
# A name to give the cloudant db
variable "cloudant_name" {
  description = "The name for the cloudant DB instance."
  default = "schematics-test-cloudant" # must be unique across all CF apps
}
# A name to give the cloudant db service key
variable "cloudant_key" {
  description = "A name for the cloudant DB instance service key."
  default = "schematics-test-key"
}
`;
	}

	function outputs() {
		return `
#############################################################################
# Outputs
#############################################################################
output "node_ids" {
    value = ["\${ibmcloud_infra_virtual_guest.web_node.*.id}"]
}
output "cloudant_db_id" {
  value = "\${ibmcloud_cf_service_instance.cloudant.id}"
}
`;
	}

	function generateTemplate() {
		var resources = [];
		var cells = graph.model.cells;
		for (var key in cells) {
			if (cells.hasOwnProperty(key)) {
				var s = cells[key].getStyle();
				if (s) {
					var res = s.match(/ibmcloud.*?;/);
					if (res.length) {
						resources.push(res[0]);
					}
				}
			}
		}

		if (resources.length) {
			var crlf = "\n";
			var template = preamble() + crlf;
			resources.forEach(function(r) {
				if (r == "ibmcloud.virtualserver") template = template + vm() + crlf;
				if (r == "ibmcloud.objectstorage") template = template + bmx_service("objectstorage") + crlf;
				if (r == "ibmcloud.whisk") template = template + bmx_service("whisk") + crlf;
				if (r == "ibmcloud.redis") template = template + bmx_service("redis") + crlf;
			}, this);

			return template + vars() + crlf;
		}
		else {
			return "";
		}
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
	tfTemplate.style.fontFamily = 'Consolas;Courier New;Courier'
  	tfTemplate.value = '';
	mxUtils.br(div);
	div.appendChild(tfTemplate);
	
	// Extends Extras menu
	mxResources.parse('ibmcloud=Generate IBM Cloud Schematics Template');

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