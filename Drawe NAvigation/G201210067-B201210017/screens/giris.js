// giris.js
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';

const DoctorLoginScreen = () => {

  const navigation = useNavigation()

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const login = () => {
    let formattedEmail = email.toLowerCase() == 'admin' ? 'merve@gmail.com' : email
    auth.signInWithEmailAndPassword(formattedEmail,password).then(()=>{
      navigation.navigate('admin')
    }).catch(()=> {
      Alert.alert('Sifre yanlis')
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tahlil Kontrolü</Text>
      </View>

      {/* Giriş Alanları ve Buton Container */}
      <View style={styles.loginContainer}>
        {/* Giriş Alanları */}
        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Kullanıcı adınızı girin"
              placeholderTextColor="#7a9eaf"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifrenizi girin"
              placeholderTextColor="#7a9eaf"
              secureTextEntry
            />
          </View>
        </View>

        {/* Buton */}
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DoctorLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#4caf50',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#388e3c',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  loginContainer: {
    backgroundColor: '#e8f5fc',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#388e3c',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#388e3c',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7a9eaf',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007acc',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
