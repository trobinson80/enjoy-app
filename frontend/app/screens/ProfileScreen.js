import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import * as authStorage from '../auth/authStorage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUserData = async () => {
      const userData = await authStorage.getUserSession();
      setUser(userData);
    };
    loadUserData();
  }, []);

  const SettingItem = ({ icon, title, value, onPress }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#666" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.email ? user.email[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.emailText}>{user?.email || 'Loading...'}</Text>
      </View>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <SettingItem 
          icon="person-outline" 
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem 
          icon="notifications-outline" 
          title="Notifications"
          value="On"
          onPress={() => console.log('Notifications')}
        />
        <SettingItem 
          icon="lock-closed-outline" 
          title="Privacy"
          onPress={() => console.log('Privacy')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem 
          icon="film-outline" 
          title="Movie Preferences"
          onPress={() => console.log('Movie Preferences')}
        />
        <SettingItem 
          icon="color-palette-outline" 
          title="Theme"
          value="Light"
          onPress={() => console.log('Theme')}
        />
        <SettingItem 
          icon="language-outline" 
          title="Language"
          value="English"
          onPress={() => console.log('Language')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <SettingItem 
          icon="help-circle-outline" 
          title="FAQ"
          onPress={() => console.log('FAQ')}
        />
        <SettingItem 
          icon="mail-outline" 
          title="Contact Us"
          onPress={() => console.log('Contact Us')}
        />
        <SettingItem 
          icon="information-circle-outline" 
          title="About"
          onPress={() => console.log('About')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 18,
    color: '#333',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    padding: 15,
    paddingBottom: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
});

export default ProfileScreen;