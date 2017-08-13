import {CellHookData, HookData} from "./HookData";

/**
 * Ratio between font size and font height. The number comes from jspdf's source code
 */
export let FONT_ROW_RATIO = 1.15;
import state from './state';
import {assign} from './polyfills';
import {Table} from "./models";

interface ColumnOption {
    header?: string;
    title?: string; // deprecated (same as header)
    footer?: string;
    dataKey?: string|number;
}

interface UserOptions {
    columns?: string[]|ColumnOption[];
    data?: any[][];
    
    html?: HTMLTableElement|string;
    hiddenHTML?: boolean;
    useCSS?: boolean;

    headerRows?: number;
    footerRows?: number;
    
    startY?: number;
    margin?: MarginPadding;
    pageBreakTable?: boolean;
    pageBreakRow?: boolean;
    tableWidth?: 'auto'|'wrap'|number;
    showHeader?: 'everyPage'|'firstPage'|'never';
    showFooter?: 'everyPage'|'lastPage'|'never';
    tableLineWidth?: number;
    tableLineColor?: Color;
    allSectionHooks?: boolean;
    tableId?: any;

    theme?: 'striped'|'plain'|'grid'|'css';
    styles?: Styles;
    headerStyles?: Styles;
    bodyStyles?: Styles;
    footerStyles?: Styles;
    alternateRowStyles?: Styles;
    columnStyles?: Styles; // Prefer using the parseCell hook instead of this

    drawPageHeader?: () => {}; // Alias to didDrawPage
    drawPageFooter?: () => {}; // Alias to didDrawPage
    drawCellContent?: () => {}; // Alias to didDrawCell
    
    didParseCell?: () => {};
    willDrawCell?: () => {};
    didDrawCell?: () => {};
    didDrawPage?: () => {};

    createdCell?: () => {}; // Deprecated (renamed to parseCell)
    drawCell?: () => {}; // Deprecated (renamed to willDrawCell)
    addPageContent?: () => {}; // Deprecated (renamed to didDrawPage)
}

export function parseSettings(table: Table, allOptions) {

    
}

type Color = [number, number, number]|number|'transparent'|false;
type MarginPadding = number|{top?: number, right?: number, bottom?: number, left?: number}

interface Styles {
    font?: 'helvetica'|'times'|'courier',
    fontStyle?: 'normal'|'bold'|'italic'|'bolditalic',
    overflow?: 'linebreak'|'ellipsize'|'visible'|'hidden',
    fillColor?: Color,
    textColor?: Color,
    halign?: 'left'|'center'|'right',
    valign?: 'top'|'middle'|'bottom',
    fontSize?: number,
    cellPadding?: number,
    lineColor?: Color,
    lineWidth?: number,
    cellWidth?: 'auto'|'wrap'|number,
    minCellHeight?: number
}

interface CellDefinition {
    rowSpan?: number,
    colSpan?: number,
    styles?: Styles,
}

type CellType = null|string|number|boolean|CellDefinition
type MultipleRowType = CellType[][]|{string: CellType}[]
type SingleRowType = CellType[]|{string: CellType}

interface BaseConfig {
    // Properties
    theme?: 'auto'|'striped'|'grid'|'plain', // default: striped
    startY?: false|number,
    margin?: MarginPadding,
    avoidTableSplit?: boolean,
    avoidRowSplit?: boolean,
    tableWidth?: 'auto'|'wrap'|number,
    showHeader?: 'everyPage'|'firstPage'|'never',
    showFooter?: 'everyPage'|'lastPage'|'never',
    tableLineWidth?: number,
    tableLineColor?: Color,
    allSectionHooks?: boolean; // default: false
    tableId?: any,

    // Styles
    styles?: Styles,
    bodyStyles?: Styles,
    headStyles?: Styles,
    footStyles?: Styles,
    alternateRowStyles?: Styles,
    columnStyles?: Styles,
    
    // Hooks
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: CellHookData) => void;
}

export interface ContentConfig extends BaseConfig {
    head?: SingleRowType|MultipleRowType
    foot?: SingleRowType|MultipleRowType
    body: MultipleRowType
}

export interface HTMLConfig extends BaseConfig {
    html: string|HTMLElement;
}

export function defaultConfig() {
    return {
        // Html content
        html: null,
        
        // Custom content
        head: null,
        body: null,
        foot: null,

        // Properties
        theme: 'auto', // 'striped', 'grid' or 'plain'
        includeHiddenHTML: false,
        useCss: false,
        startY: false, // false indicates the margin top value
        margin: 40 / state().scaleFactor,
        avoidTableSplit: false,
        avoidRowSplit: false,
        tableWidth: 'auto', // 'auto'|'wrap'|number
        showHeader: 'everyPage', // 'everyPage', 'firstPage', 'never',
        showFooter: 'everyPage', // 'everyPage', 'lastPage', 'never',
        tableLineWidth: 0,
        tableLineColor: 200,
        allSectionHooks: false, // Set to true if you want the hooks to be called for cells outside of the body section (i.e. head and foot)
        tableId: null,

        // Styling
        styles: {},
        headStyles: {},
        bodyStyles: {},
        footStyles: {},
        alternateRowStyles: {},
        columnStyles: {},
        
        // Hooks
        didParseCell: function(data) {},
        willDrawCell: function(data) {},
        didDrawCell: function(data) {},
        didDrawPage: function(data) {},
    }
}

// Base style for all themes
export function defaultStyles() {
    return {
        font: "helvetica", // helvetica, times, courier
        fontStyle: 'normal', // normal, bold, italic, bolditalic
        overflow: 'linebreak', // linebreak, ellipsize, visible or hidden
        fillColor: false, // Either false for transparent, rbg array e.g. [255, 255, 255] or gray level e.g 200
        textColor: 20,
        halign: 'left', // left, center, right
        valign: 'top', // top, middle, bottom
        fontSize: 10,
        cellPadding: 5 / state().scaleFactor, // number or {top,left,right,left,vertical,horizontal}
        lineColor: 200,
        lineWidth: 0 / state().scaleFactor,
        cellWidth: 'auto', // 'auto'|'wrap'|number
        minCellHeight: 0
    }
}

/**
 * Styles for the themes (overriding the default styles)
 */
export function getTheme(name) {
    let themes = {
        'striped': {
            table: {fillColor: 255, textColor: 80, fontStyle: 'normal'},
            head: {textColor: 255, fillColor: [41, 128, 185], fontStyle: 'bold'},
            body: {},
            foot: {textColor: 255, fillColor: [41, 128, 185], fontStyle: 'bold'},
            alternateRow: {fillColor: 245}
        },
        'grid': {
            table: {fillColor: 255, textColor: 80, fontStyle: 'normal', lineWidth: 0.1},
            head: {textColor: 255, fillColor: [26, 188, 156], fontStyle: 'bold', lineWidth: 0},
            body: {},
            foot: {textColor: 255, fillColor: [26, 188, 156], fontStyle: 'bold', lineWidth: 0},
            alternateRow: {}
        },
        'plain': {
            head: {fontStyle: 'bold'},
            foot: {fontStyle: 'bold'}
        }
    };
    return themes[name];
}