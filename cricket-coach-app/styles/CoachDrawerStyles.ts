import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  coachRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#1D4ED8',
  },
  editRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 5,
},

editImage: {
  fontSize: 14,
  color: "#1D4ED8",
  marginLeft: 5,
},

logout: {
  color: "red",
  fontWeight: "bold",
  marginTop: 30,
  marginLeft: 20,
},

});
