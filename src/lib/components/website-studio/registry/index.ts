import type { ComponentRegistry } from "../types";

// Base
import { ButtonConfig } from "./button";
import { BadgeConfig } from "./badge";
import { AvatarConfig } from "./avatar";
import { CardConfig } from "./card";
import { TypographyConfig } from "./typography";
import { IconButtonConfig } from "./icon-button";
import { ShapeConfig } from "./shape";
import { ButtonGroupConfig } from "./button-group";
import { SplitButtonConfig } from "./split-button";

// Layout
import { FlexConfig } from "./flex";
import { GridConfig } from "./grid";
import { DividerConfig } from "./divider";
import { AccordionRootConfig, AccordionItemConfig } from "./accordion";
import { ItemConfig } from "./item";
import { TimelineRootConfig, TimelineItemConfig } from "./timeline";
import { ElasticScrollAreaConfig } from "./elastic-scroll-area";
import { DeviceFrameConfig } from "./device-frame";
import { InfiniteScrollConfig } from "./infinite-scroll";
import { SheetConfig } from "./sheet";
import { PullToRefreshConfig } from "./pull-to-refresh";
import { MasonryConfig } from "./masonry";
import { ResizableConfig } from "./resizable";
import { SeparatorConfig } from "./separator";
import { DialogConfig } from "./dialog";

// Navigation
import { BreadcrumbConfig } from "./breadcrumb";
import { TabsConfig } from "./tabs";
import { AppBarConfig } from "./appbar";
import { BottomTabsConfig } from "./bottom-tabs";
import { NavigationRailConfig } from "./navigation-rail";
import { SidebarConfig } from "./sidebar";
import { TaskbarConfig } from "./taskbar";
import { DropdownMenuConfig } from "./dropdown-menu";
import { ToolbarConfig } from "./toolbar";
import { SearchViewConfig } from "./search-view";
import { NavigationMenuConfig } from "./navigation-menu";
import { MenubarConfig } from "./menubar";
import { ContextMenuConfig } from "./context-menu";
import { CommandConfig } from "./command";
import { StackRouterConfig } from "./stack-router";

// Forms & Inputs
import { InputConfig } from "./input";
import { NumberInputConfig } from "./number-input";
import { TextareaConfig } from "./textarea";
import { SelectConfig } from "./select";
import { MultiSelectConfig } from "./multi-select";
import { ComboboxConfig } from "./combobox";
import { CheckboxConfig } from "./checkbox";
import { RadioGroupConfig } from "./radio-group";
import { SwitchConfig } from "./switch";
import { SliderConfig } from "./slider";
import { DropzoneConfig } from "./dropzone";
import { ColorPickerConfig } from "./color-picker";
import { DatePickerConfig } from "./date-picker";
import { TimePickerConfig } from "./time-picker";
import { LexicalEditorConfig } from "./lexical-editor";
import { MediumTextEditorConfig } from "./medium-text-editor";
import { OTPFieldConfig } from "./otp-field";
import { LocationPickerConfig } from "./location-picker";
import { DateInputConfig } from "./date-input";
import { TimeInputConfig } from "./time-input";
import { BarLineSliderConfig } from "./bar-line-slider";
import { InputGroupConfig } from "./input-group";
import { FieldConfig } from "./field";
import { StandaloneCalendarConfig } from "./calendar";
import { InfiniteCalendarConfig } from "./infinite-calendar";

// Feedback & Interactions
import { LinearProgressConfig, CircularProgressConfig } from "./progress";
import { TooltipConfig } from "./tooltip";
import { BouncyBoxConfig } from "./bouncy-box";
import { LoadingIndicatorConfig } from "./loading-indicator";
import { SkeletonConfig } from "./skeleton";
import { FloatingPanelConfig } from "./floating-panel";
import { FABMenuConfig } from "./fab-menu";
import { StepperConfig } from "./stepper";
import { LayoutRouterConfig } from "./layout-router";
import { ToastTriggerConfig } from "./toast-trigger";
import { ShallowRouterConfig } from "./shallow-router";
import { ViewTransitionConfig } from "./view-transition";

// Media & Elements
import { ImageConfig } from "./image";
import { CarouselConfig } from "./carousel";
import { CarouselItemConfig } from "./carousel-item";
import { VideoPlayerConfig } from "./video-player";
import { CodeEditorConfig } from "./code-editor";
import { QRCodeConfig } from "./qr-code";
import { AlertConfig } from "./alert";
import { EmptyStateConfig } from "./empty-state";
import { FABConfig } from "./fab";
import { InstallCommandConfig } from "./install-command";
import { KbdConfig } from "./kbd";
import { ChipConfig } from "./chip";
import { MapConfig } from "./map";
import { AvatarGroupConfig } from "./avatar-group";
import { FontPickerConfig } from "./font-picker";
import { LayoutDirectionToggleConfig } from "./layout-toggle";

// Data Display
import { AreaChartConfig } from "./area-chart";
import { BarChartConfig } from "./bar-chart";
import { LineChartConfig } from "./line-chart";
import { PieChartConfig } from "./pie-chart";
import { DataTableConfig } from "./data-table";
import { FullCalendarConfig } from "./full-calendar";
import { DataDisplayConfig } from "./data-display";
import { VirtualListConfig } from "./virtual-list";
import { VirtualGridConfig } from "./virtual-grid";
import { TreeViewConfig } from "./tree-view";
import { VirtualFlexConfig } from "./virtual-flex";
import { TableConfig } from "./table";

export const CoreRegistry: ComponentRegistry = {
  // Base Elements
  Button: ButtonConfig,
  IconButton: IconButtonConfig,
  FAB: FABConfig,
  Chip: ChipConfig,
  Badge: BadgeConfig,
  Avatar: AvatarConfig,
  Typography: TypographyConfig,
  Divider: DividerConfig,
  AlertBox: AlertConfig,
  EmptyState: EmptyStateConfig,
  QRCode: QRCodeConfig,
  InstallCommand: InstallCommandConfig,
  Kbd: KbdConfig,
  Shape: ShapeConfig,
  ButtonGroup: ButtonGroupConfig,
  SplitButton: SplitButtonConfig,

  // Layouts & Interactions
  Card: CardConfig,
  Sheet: SheetConfig,
  FlexBox: FlexConfig,
  GridBox: GridConfig,
  ListItem: ItemConfig,
  Accordion: AccordionRootConfig,
  AccordionItem: AccordionItemConfig,
  Timeline: TimelineRootConfig,
  TimelineItem: TimelineItemConfig,
  ElasticScrollArea: ElasticScrollAreaConfig,
  InfiniteScroll: InfiniteScrollConfig,
  BouncyBox: BouncyBoxConfig,
  DeviceFrame: DeviceFrameConfig,
  FloatingPanel: FloatingPanelConfig,
  FABMenu: FABMenuConfig,
  Stepper: StepperConfig,
  PullToRefresh: PullToRefreshConfig,
  ContextMenu: ContextMenuConfig,
  Masonry: MasonryConfig,
  Resizable: ResizableConfig,
  Separator: SeparatorConfig,
  Dialog: DialogConfig,
  LayoutRouter: LayoutRouterConfig,
  ToastTrigger: ToastTriggerConfig,
  ShallowRouter: ShallowRouterConfig,
  ViewTransition: ViewTransitionConfig,

  // Navigation
  Breadcrumb: BreadcrumbConfig,
  Tabs: TabsConfig,
  AppBar: AppBarConfig,
  BottomTabs: BottomTabsConfig,
  NavigationRail: NavigationRailConfig,
  Sidebar: SidebarConfig,
  Taskbar: TaskbarConfig,
  DropdownMenu: DropdownMenuConfig,
  Toolbar: ToolbarConfig,
  SearchView: SearchViewConfig,
  NavigationMenu: NavigationMenuConfig,
  Menubar: MenubarConfig,
  Command: CommandConfig,
  StackRouter: StackRouterConfig,

  // Forms
  Input: InputConfig,
  NumberInput: NumberInputConfig,
  Textarea: TextareaConfig,
  Select: SelectConfig,
  MultiSelect: MultiSelectConfig,
  Combobox: ComboboxConfig,
  Checkbox: CheckboxConfig,
  RadioGroup: RadioGroupConfig,
  Switch: SwitchConfig,
  Slider: SliderConfig,
  Dropzone: DropzoneConfig,
  ColorPicker: ColorPickerConfig,
  DatePicker: DatePickerConfig,
  TimePicker: TimePickerConfig,
  RichTextEditor: LexicalEditorConfig,
  BlockEditor: MediumTextEditorConfig,
  OTPField: OTPFieldConfig,
  LocationPicker: LocationPickerConfig,
  DateInput: DateInputConfig,
  TimeInput: TimeInputConfig,
  BarLineSlider: BarLineSliderConfig,
  InputGroup: InputGroupConfig,
  Field: FieldConfig,
  StandaloneCalendar: StandaloneCalendarConfig,
  InfiniteCalendar: InfiniteCalendarConfig,

  // Feedback
  LinearProgress: LinearProgressConfig,
  CircularProgress: CircularProgressConfig,
  Tooltip: TooltipConfig,
  LoadingIndicator: LoadingIndicatorConfig,
  Skeleton: SkeletonConfig,

  // Media & Data
  Image: ImageConfig,
  Carousel: CarouselConfig,
  CarouselItem: CarouselItemConfig,
  VideoPlayer: VideoPlayerConfig,
  CodeBlock: CodeEditorConfig,
  Map: MapConfig,
  AvatarGroup: AvatarGroupConfig,

  // Data Display
  DataDisplay: DataDisplayConfig,
  VirtualList: VirtualListConfig,
  VirtualGrid: VirtualGridConfig,
  TreeView: TreeViewConfig,
  VirtualFlex: VirtualFlexConfig,
  DataTable: DataTableConfig,
  FullCalendar: FullCalendarConfig,

  // Charts
  AreaChart: AreaChartConfig,
  BarChart: BarChartConfig,
  LineChart: LineChartConfig,
  PieChart: PieChartConfig,
  Table: TableConfig,

  // Theme Controls
  FontPicker: FontPickerConfig,
  LayoutDirectionToggle: LayoutDirectionToggleConfig,
};

export default CoreRegistry;
