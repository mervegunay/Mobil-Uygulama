import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorLoginScreen from '../screens/giris';

const Stack = createNativeStackNavigator()

export const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
        >
            <Stack.Screen
                name="Login"
                component={DoctorLoginScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}