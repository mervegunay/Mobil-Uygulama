import { createDrawerNavigator } from '@react-navigation/drawer';
import DoctorLoginScreen from '../screens/giris';
import ReferenceRange from '../screens/deger';
import Guide from '../screens/kilavuzekle';

const Drawer = createDrawerNavigator();

export const AdminNavigator = () => {
    return (
        <Drawer.Navigator
            initialRouteName="ReferenceRange"
            screenOptions={{
                headerStyle: { backgroundColor: '#4caf50' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                drawerActiveTintColor: '#4caf50',
            }}
        >
            <Drawer.Screen
                name="ReferenceRange"
                component={ReferenceRange}
                options={{ title: 'Değer Hesaplama' }}
            />
            <Drawer.Screen
                name="Guide"
                component={Guide}
                options={{ title: 'Kılavuz Ekleme' }}
            />
        </Drawer.Navigator>
    )
}