declare module '@react-native-community/datetimepicker' {
  import { ComponentType } from 'react';
    import { ViewProps } from 'react-native';

  export type DateTimePickerEvent = any;

  export interface DateTimePickerProps extends ViewProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
  }

  const DateTimePicker: ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}
