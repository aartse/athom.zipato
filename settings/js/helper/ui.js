var uiHelper = (function() {

	function createTable(rows, args)
	{
		var table = document.createElement("table");
		table.setAttribute('class', 'decorated');

		for (var i=0; i<rows.length; i++) {
			var row = rows[i];

			var tableRow = document.createElement("tr");
			table.appendChild(tableRow);

			var tableLabel = document.createElement("th");
			tableLabel.innerText = row.label;
			tableRow.appendChild(tableLabel);

			var tableValue = document.createElement("td");
			tableValue.innerText = row.value;
			tableRow.appendChild(tableValue);
		}

		if (typeof args !== 'undefined') {
			if (typeof args.editButton !== 'undefined') {
				var tableRow = document.createElement("tr");
				table.appendChild(tableRow);

				var tableValue = document.createElement("td");
				tableValue.colSpan=2;
				tableValue.appendChild(args.editButton);
				tableRow.appendChild(tableValue);
			}
		}

		return table;
	}

	function createChecklist(name, items)
	{
		var checklist = document.createElement("div");
		checklist.className = 'decorated';

		for (var i=0; i<items.length; i++) {
			var item = items[i];

			var checklistItem = document.createElement("div");
			checklistItem.className = 'field row';
			checklist.appendChild(checklistItem);

			var input = document.createElement("input");
			input.type = 'checkbox';
			input.name = name + '[]';
			input.id = name + '_' + item.id;
			input.value = item.id;
			input.checked = item.checked;
			checklist.appendChild(input);

			var label = document.createElement("label");
			label.htmlFor = name + '_' + item.id;
			label.innerText = item.label;
			checklist.appendChild(label);
		}

		return checklist;
	}

	return {
		createTable: createTable,
		createChecklist: createChecklist
	}
});