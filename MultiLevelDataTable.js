(function ($) {
    /**Массив таблиц */
    let Tables = [];
    /**Массив имен полей */
    let Descriptions;
    /**Данные таблицы */
    let TableSrc;
    /**
     * Многоуровневая таблица
     * @param {any} options
     */
    $.fn.MultiLevelDataTable = function (options) {
        let settings = $.extend({
            data: [{
                Id: 0,
                F1: '',
                SubTable: []
            }], //данные для таблицы
            fieldDescriptions: [] //имена полей
        }, options);

        

        if (!DataValid(settings.data)) {
            throw new Error('invalid parameters MultiLevelDataTable');
        }
                  
        Descriptions = settings.fieldDescriptions;
        TableSrc = settings.data;

        CreateFormatRootTable(this, TableSrc)
        InitRootTable(TableSrc);
        return this;
    };
    /**
     * Корректность формата фходных данных
     * @param {any} d
     */
    function DataValid(d) {
        if (!d) return false;
        if (!Array.isArray(d)) return false;
        if (d.length == 0) return false;
        return true;
    }
    /**
 * Создать формат подтаблицы
 * @param {any} d источник данных
 */
    function CreateFormatSubtable(parentId, d) {
        if (!d.SubTable || d.SubTable.length == 0) return;
        const TableId = parentId + '-sub' + d.Id;
        let _format = '<table id="' + TableId + '" class="display" style="width: 100%; text-align: center; margin-left:50px;"><thead><tr><th></th>';
        for (const key in d.SubTable[0]) {
            if (key == 'Id' || key == 'SubTable') continue;
            const FildName = Descriptions.find((item, index, array) => item.Name == key)?.Description;
            _format += '<th>';
            _format += FildName ? FildName : key;
            _format += '</th>';
        }
        _format += '</tr></thead></table >';
        return _format;
    }
    /**
     * Создать подтаблицу
     * @param {any} d источник данных
     */
    function SubTable(parentId, d) {
        if (!d.SubTable || d.SubTable.length == 0) return;
        const TableId = parentId + '-sub' + d.Id;
        let _collumns = [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: ''
            }
        ];
        for (const key in d.SubTable[0]) {
            if (key == 'Id' || key == 'SubTable') continue;
            _collumns.push({ data: key });
        }
        const CurrentTable = $('#' + TableId).DataTable(
            {
                data: d.SubTable,
                columns: _collumns,
                order: [[1, "asc"]],
                dom: "<fl<t>ip>"
            });

        AddTable(TableId, CurrentTable);
    }
    /**
     * Запомнить таблицу в массиве
     * @param {any} tableId ID таблицы
     * @param {any} currentTable объект DataTable
     */
    function AddTable(tableId, currentTable) {
        RemoveTable(tableId);
        Tables.push({ Id: tableId, Table: currentTable });
    }
    /**
     * Удалить таблицу из массива
     * @param {any} tableId ID таблицы
     */
    function RemoveTable(_tableId) {
        Tables = Tables.filter((item, index, array) => item.Id != _tableId);
    }
    /**
     * Инициализировать корневую таблицу
     * @param {any} TableSrc источник данных
     */
    function InitRootTable(TableSrc) {
        let _collumns = [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: ''
            }
        ];
        for (const key in TableSrc[0]) {
            if (key == 'Id' || key == 'SubTable') continue;
            _collumns.push({ data: key });
        }
        const RootTable = $('#TableRoot').DataTable(
            {
                data: TableSrc,
                columns: _collumns,
                order: [[1, "asc"]],
                dom: "<fl<t>ip>"
            });

        AddTable('TableRoot', RootTable);

        // обработчик клина на "+" открытие/закрытие подтаблиц
        $('table tbody').on('click', 'td.details-control', function () {
            const tableId = $(this).closest('table').attr('id');
            const table = Tables.find((item, index, array) => item.Id == tableId)?.Table;
            const tr = $(this).closest('tr');
            const row = table.row(tr);
            if (row.child.isShown()) {
                // Если подтаблицы открыта - закрыть ее
                row.child.hide();
                tr.removeClass('shown');
                RemoveTable(tableId + '-sub' + row.data().Id);
            }
            else {
                // Открыть подтаблицу
                if (!row.data().SubTable || row.data().SubTable.length == 0) return;
                row.child(CreateFormatSubtable(tableId, row.data())).show();
                SubTable(tableId, row.data());
                tr.addClass('shown');
            }
        });
    }

    /**
     * Создать формат корневой таблицы
     * @param {any} target целефой div, где нужно создать таблицу
     * @param {any} dataSrc источник данных для таблицы
     */
    function CreateFormatRootTable(target, dataSrc) {
        const TableId = 'TableRoot';
        let _format = '<table id="' + TableId + '" class="display" style="width: 100%; text-align: center;"><thead><tr><th></th>';
        for (const key in dataSrc[0]) {
            if (key == 'Id' || key == 'SubTable') continue;
            const FildName = Descriptions.find((item, index, array) => item.Name == key)?.Description;
            _format += '<th>';
            _format += FildName ? FildName : key;
            _format += '</th>';
        }
        _format += '</tr></thead></table >';
        target.replaceWith(_format);
    }

})(jQuery);