frappe.listview_settings["User"] = {
	onload: function () {
		if (frappe.session.user == "Administrator") {
			$("body").removeClass("hide_system_user");
        } else {
			$("body").addClass("hide_system_user");
		}
	},
};
