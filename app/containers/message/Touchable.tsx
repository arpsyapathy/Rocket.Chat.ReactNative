import React, { useContext, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import TouchablePlatform from 'react-native-platform-touchable';
import Animated, { runOnJS, useAnimatedGestureHandler, useSharedValue } from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';

import MessageContext from './Context';
import i18n from '../../i18n';

type Props = {
    onPress?: () => void;
    onLongPress?: () => void;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
    children: React.ReactNode;
};

// Trigger threshold in px to fire reply
const SWIPE_REPLY_THRESHOLD = 48;

const RCTouchable = React.memo((props: Props) => {
    const { onPress, onLongPress, disabled, style, children } = props;
    const { onSwipeReply } = useContext<any>(MessageContext);

    const threshold = SWIPE_REPLY_THRESHOLD;
    const rtl = i18n.isRTL;

    // Track whether reply was triggered on this gesture
    const triggered = useSharedValue(false);

    const onEnd = useMemo(
        () =>
            ({ translationX }: PanGestureHandlerEventPayload) => {
                if (disabled) {
                    return;
                }
                if (triggered.value) {
                    // Already handled
                    return;
                }
                const passed = rtl ? translationX <= -threshold : translationX >= threshold;
                if (passed && typeof onSwipeReply === 'function') {
                    triggered.value = true;
                    runOnJS(onSwipeReply)();
                }
            },
        [disabled, onSwipeReply, rtl, threshold]
    );

    const onGestureEvent = useAnimatedGestureHandler<PanGestureHandlerEventPayload>({
        onActive: () => {
            // no-op, we only care about the end state
        },
        onEnd
    });

    return (
        <PanGestureHandler
            // Only become active on meaningful horizontal movement; let vertical scrolling win
            activeOffsetX={[-16, 16]}
            activeOffsetY={[-8, 8]}
            onGestureEvent={onGestureEvent}
            enabled={!disabled}
        >
            <Animated.View>
                <TouchablePlatform onLongPress={onLongPress} onPress={onPress} disabled={disabled} style={style}>
                    {children}
                </TouchablePlatform>
            </Animated.View>
        </PanGestureHandler>
    );
});

// Keep platform touchable helpers for compatibility
// @ts-ignore
RCTouchable.Ripple = (...args: any[]) => TouchablePlatform.Ripple?.(...args);
RCTouchable.SelectableBackgroundBorderless = () => TouchablePlatform.SelectableBackgroundBorderless?.();

export default RCTouchable;
