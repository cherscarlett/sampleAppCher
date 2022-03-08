import {
    Animated,
    Dimensions,
    StyleSheet,
} from 'react-native';

import React from 'react';

interface Props {
    top: number,
    left: number,
    id: string,
    onAnimationEnd: (id: string) => void,
}

interface State {
    timer: number,
    intervalId: NodeJS.Timer,
    animation: Animated.Value,
}

class FocusCircle extends React.Component<Props, State> {
    state: State = {
        timer: 2,
        intervalId: setInterval(() => {}),
        animation : new Animated.Value(0),
    };

    constructor(props: Props) {
        super(props);
        this._timer = this._timer.bind(this);
        this._fadeIn = this._fadeIn.bind(this);
        this._fadeOut = this._fadeOut.bind(this);
    };

    componentDidMount() {
        let intervalId = setInterval(this._timer, 2000);
        this.setState({intervalId: intervalId});
        requestAnimationFrame(this._fadeIn);
    };

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    };

    _timer() {
        this.setState({ timer: this.state.timer - 1 });

        if (this.state.timer === 1) { 
            requestAnimationFrame(this._fadeOut);
        }

        if (this.state.timer < 1) {
            this.props.onAnimationEnd(this.props.id);
            clearInterval(this.state.intervalId);
        }
    };

    _fadeIn = () => {
        Animated.timing(this.state.animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        } as any).start();
    };

    _fadeOut = () => {
        Animated.timing(this.state.animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        } as any).start();
    };

    render() {
        return (
            <Animated.View 
                key={this.props.id}
                style={[styles.focusCircle, 
                    {
                        left: this.props.left, 
                        top: this.props.top,
                        opacity: this.state.animation,
                    }]} 
            />
        )
    }
}

export default FocusCircle;

const FocusCircleHeight = 64;

const styles = StyleSheet.create({
    focusCircle: {
        backgroundColor: 'transparent',
        borderRadius: FocusCircleHeight/2,
        borderWidth: 2,
        borderColor: 'white',
        height: FocusCircleHeight,
        width: FocusCircleHeight,
        position: 'absolute', 
        marginLeft: FocusCircleHeight/2 * -1,
        marginTop: FocusCircleHeight/2 * -1,
    },
});
