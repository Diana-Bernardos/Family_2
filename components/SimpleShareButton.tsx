// components/SimpleShareButton.tsx
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  FlatList,
  Alert,
  Image,
  Platform,
  Share
} from 'react-native';
import { Share2, Check, X } from 'lucide-react-native';
import { useFamilyStore } from '../stores/familyStore';
import { THEME_COLORS } from '../constants/theme';

interface SimpleShareButtonProps {
  title?: string;
  size?: number;
  style?: any;
  buttonText?: string;
  iconColor?: string;
}

const SimpleShareButton: React.FC<SimpleShareButtonProps> = ({
  title = "Familia App",
  size = 20,
  style,
  buttonText,
  iconColor = THEME_COLORS.primary
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const { 
    members, 
    addNotification 
  } = useFamilyStore();

  // Abrir el modal
  const openShareModal = () => {
    console.log("Abriendo modal de compartir"); // Depuración
    if (members.length === 0) {
      // Si no hay miembros, usar la API nativa de compartir
      handleNativeShare();
      return;
    }
    setModalVisible(true);
  };

  // Usar la API nativa de compartir del dispositivo
  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: `${title} - Comparte con tu familia`,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        console.log("Contenido compartido con éxito");
      } else if (result.action === Share.dismissedAction) {
        console.log("Compartir cancelado");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      Alert.alert("Error", "No se pudo compartir el contenido");
    }
  };

  // Seleccionar/deseleccionar un miembro
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  // Compartir con los miembros seleccionados
  const shareWithMembers = () => {
    console.log("Compartiendo con miembros:", selectedMembers); // Depuración
    if (selectedMembers.length === 0) {
      setModalVisible(false);
      return;
    }

    // Crear una notificación para cada miembro seleccionado
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    selectedMembers.forEach(memberId => {
      addNotification({
        id: `share-${Date.now()}-${memberId}`,
        title: "Información compartida contigo",
        message: `Un miembro de la familia ha compartido información importante contigo: "${title}"`,
        date: dateStr,
        time: timeStr,
        read: false,
        type: "system",
        relatedId: ""
      });
    });

    // Mostrar confirmación
    const recipientNames = selectedMembers.map(id => {
      const member = members.find(m => m.id === id);
      return member ? member.name : 'un miembro de la familia';
    });

    Alert.alert(
      'Compartido',
      `La información ha sido compartida con ${recipientNames.join(', ')}.`
    );

    // Limpiar selección y cerrar modal
    setSelectedMembers([]);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.shareButton, style]}
        onPress={openShareModal}
        activeOpacity={0.7} // Asegura feedback visual
      >
        <Share2 size={size} color={iconColor} />
        {buttonText && <Text style={[styles.buttonText, {color: iconColor}]}>{buttonText}</Text>}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedMembers([]);
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compartir</Text>
              <TouchableOpacity 
                onPress={() => {
                  setSelectedMembers([]);
                  setModalVisible(false);
                }} 
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={THEME_COLORS.text || "#1f2937"} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.shareText}>
              Compartir con:
            </Text>
            
            {members.length > 0 ? (
              <FlatList
                data={members}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.memberItem,
                      selectedMembers.includes(item.id) && styles.memberItemSelected
                    ]}
                    onPress={() => toggleMemberSelection(item.id)}
                    activeOpacity={0.7}
                  >
                    {item.avatar && (
                      <Image 
                        source={{ uri: item.avatar }} 
                        style={styles.avatar} 
                      />
                    )}
                    <Text style={styles.memberName}>{item.name}</Text>
                    {selectedMembers.includes(item.id) && (
                      <Check size={20} color={THEME_COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.membersList}
              />
            ) : (
              <Text style={styles.noMembersText}>
                No hay miembros de familia registrados para compartir.
              </Text>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedMembers([]);
                  setModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  selectedMembers.length === 0 && styles.confirmButtonDisabled
                ]}
                onPress={shareWithMembers}
                disabled={selectedMembers.length === 0}
                activeOpacity={0.7}
              >
                <Share2 size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  shareText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  membersList: {
    width: '100%',
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f3f4f6',
  },
  memberItemSelected: {
    backgroundColor: '#f3f4f6',
    borderColor: THEME_COLORS.primary,
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  noMembersText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default SimpleShareButton;