import * as React from 'react';
import { PositionValues, RenderRowsConfig } from '@epam/uui-components';
import { ColumnsConfig, DataRowProps, useUuiContext, uuiScrollShadows, useColumnsConfig, uuiMarkers, IEditable, DataTableState, DataTableColumnsConfigOptions, DataSourceListProps, DataColumnProps, cx } from '@epam/uui';
import { ColumnsConfigurationModal, DataTableHeaderRow, DataTableRow, DataTableMods } from './';
import { VirtualList } from '../';
import * as css from './DataTable.scss';

export interface DataTableProps<TItem, TId> extends IEditable<DataTableState>, DataSourceListProps, DataTableColumnsConfigOptions {
    getRows(): DataRowProps<TItem, TId>[];
    columns: DataColumnProps<TItem, TId>[];
    renderRow?(props: DataRowProps<TItem, TId>): React.ReactNode;
    renderNoResultsBlock?(): React.ReactNode;
    onScroll?(value: PositionValues): void;
    showColumnsConfig?: boolean;
};

export function DataTable<TItem, TId>(props: React.PropsWithChildren<DataTableProps<TItem, TId> & DataTableMods>) {
    const { uuiModals } = useUuiContext();
    const { columns, config, defaultConfig } = useColumnsConfig(props.columns, props.value?.columnsConfig);

    const renderRow = (rowProps: DataRowProps<TItem, TId>) => (
        <DataTableRow
            key={ rowProps.rowKey }
            size={ props.size }
            borderBottom={ props.border }
            { ...rowProps }
        />
    );

    const renderRowsContainer = ({ listContainer, estimatedHeight, offsetY, scrollShadows }: RenderRowsConfig) => (
        <div
            role="table"
            aria-colcount={ columns.length }
            aria-rowcount={ props.rowsCount }
            className={ cx(css.table, css.shadowDark, {
                [uuiMarkers.scrolledLeft]: scrollShadows.horizontalLeft,
                [uuiMarkers.scrolledRight]: scrollShadows.horizontalRight
            }) }
        >
            <div className={ css.stickyHeader }>
                <DataTableHeaderRow
                    columns={ columns }
                    onConfigButtonClick={ props.showColumnsConfig && onConfigurationButtonClick }
                    selectAll={ props.selectAll }
                    size={ props.size }
                    textCase={ props.headerTextCase }
                    allowColumnsReordering={ props.allowColumnsReordering }
                    allowColumnsResizing={ props.allowColumnsResizing }
                    value={ props.value }
                    onValueChange={ props.onValueChange }
                />
                <div className={ cx(uuiScrollShadows.top, {
                    [uuiScrollShadows.topVisible]: scrollShadows.vertical
                }) } />
            </div>
            { props.exactRowsCount !== 0 ? (
                <div
                    role="rowgroup"
                    ref={ listContainer }
                    style={{ marginTop: offsetY, minHeight: `${estimatedHeight}px` }}
                    children={ getRows() }
                />
            ) : renderNoResultsBlock?.() }
        </div>
    );

    const getRows = () => {
        const rowRenderer = props.renderRow || renderRow;
        return props.getRows().map(row => rowRenderer({ ...row, columns }));
    };

    const renderNoResultsBlock = () => {
        // need default behavior
        return props.renderNoResultsBlock?.() || undefined;
    };

    const onConfigurationButtonClick = () => {
        uuiModals.show<ColumnsConfig>(modalProps => (
            <ColumnsConfigurationModal
                { ...modalProps }
                columns={ columns }
                columnsConfig={ config }
                defaultConfig={ defaultConfig }
            />
        ))
            .then(columnsConfig => props.onValueChange({ ...props.value, columnsConfig }))
            .catch(() => null);
    };

    return (
        <VirtualList
            value={ props.value }
            onValueChange={ props.onValueChange }
            onScroll={ props.onScroll }
            rows={ getRows() }
            rowsCount={ props.rowsCount }
            focusedIndex={ props.value?.focusedIndex }
            shadow='dark'
            renderRows={ renderRowsContainer }
        />
    );
}