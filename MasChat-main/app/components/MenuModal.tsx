import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
  type?: 'action' | 'select';
  selected?: boolean;
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
}

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, items }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.label + idx}
            style={styles.menuItem}
            onPress={() => {
              item.onPress();
              onClose();
            }}
          >
            <Ionicons name={item.icon as any} size={22} color={item.color || '#333'} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, item.color ? { color: item.color } : {}]}>{item.label}</Text>
            {item.type === 'select' && item.selected && (
              <Ionicons name="checkmark" size={20} color={item.color || '#2196F3'} style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
});

export default MenuModal; 