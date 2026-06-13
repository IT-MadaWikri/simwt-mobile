import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ImageBackground,
  Image,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { useAuth } from '../../src/contexts/AuthContext';
import { storage } from '../../src/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'mita';
  timestamp: string;
  attachment?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

const STORAGE_KEY = '@mita_chat_history';

export default function MitaChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // Initial load
  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      if (!user?.id) return;
      const key = `${STORAGE_KEY}_${user.id}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Welcome message
        setMessages([
          {
            id: '1',
            text: `Halo ${user?.nama_lengkap || 'Rekan MWT'}! 👋\nSaya Mita, asisten virtual SIMWT. Ada yang bisa saya bantu hari ini terkait Kaizen atau sistem?`,
            sender: 'mita',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }
        ]);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  };

  const saveHistory = async (newMessages: Message[]) => {
    try {
      if (!user?.id) return;
      const key = `${STORAGE_KEY}_${user.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(newMessages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      "Bersihkan Chat",
      "Apakah Anda yakin ingin menghapus semua riwayat chat ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: async () => {
            if (!user?.id) return;
            const key = `${STORAGE_KEY}_${user.id}`;
            await AsyncStorage.removeItem(key);
            setMessages([
              {
                id: Date.now().toString(),
                text: `Riwayat chat telah dibersihkan. Halo ${user?.nama_lengkap || 'Rekan MWT'}! 👋`,
                sender: 'mita',
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
              }
            ]);
          }
        }
      ]
    );
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAttachment({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream'
        });
      }
    } catch (err) {
      console.error("Failed to pick document", err);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !attachment) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      attachment: attachment
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
    
    setInputText('');
    setAttachment(null);
    setLoading(true);

    try {
      const token = await storage.getToken();
      
      const formData = new FormData();
      formData.append('message', newUserMsg.text);
      formData.append('session_id', 'mobile-' + (user?.id || 'guest'));
      
      if (newUserMsg.attachment) {
        formData.append('attachment', {
          uri: newUserMsg.attachment.uri,
          name: newUserMsg.attachment.name,
          type: newUserMsg.attachment.type,
        } as any);
      }

      const apiUrl = 'https://api.mwtpart.co.id/api/mita-chat/send';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const mitaReply: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || data.message || 'Mita telah menerima pesan Anda.',
          sender: 'mita',
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        const newHistory = [...updatedMessages, mitaReply];
        setMessages(newHistory);
        saveHistory(newHistory);
      } else {
        throw new Error(data.message || 'Gagal membalas pesan');
      }

    } catch (error) {
      console.error("Mita Chat Error:", error);
      const mitaReply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, Mita sedang mengalami gangguan koneksi. Silakan coba beberapa saat lagi. 🙏',
        sender: 'mita',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      const newHistory = [...updatedMessages, mitaReply];
      setMessages(newHistory);
      saveHistory(newHistory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperMita]}>
        {!isUser && (
          <View style={styles.mitaAvatar}>
            <MaterialCommunityIcons name="robot" size={16} color="#FFF" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleMita]}>
          {item.attachment && (
             <View style={styles.attachmentBubble}>
               <MaterialCommunityIcons name={item.attachment.type.includes('image') ? 'image' : 'file-document'} size={24} color={isUser ? '#128C7E' : '#666'} />
               <Text style={styles.attachmentName} numberOfLines={1}>{item.attachment.name}</Text>
             </View>
          )}
          {item.text.length > 0 && (
            <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextMita]}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampMita]}>
            {item.timestamp} {isUser && <MaterialCommunityIcons name="check-all" size={14} color="#34B7F1" />}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerProfile}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.mitaHeaderAvatar}>
            <MaterialCommunityIcons name="robot" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Mita Assistance</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={clearHistory}>
          <MaterialCommunityIcons name="delete-sweep" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : insets.top + 64}
      >
        {/* Chat Area with WhatsApp style background */}
        <View style={styles.chatBackground}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
          />
          {loading && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Mita sedang mengetik...</Text>
            </View>
          )}
        </View>

        {/* Attachment Preview Area */}
        {attachment && (
          <View style={styles.attachmentPreview}>
            <View style={styles.attachmentPreviewInner}>
              <MaterialCommunityIcons name={attachment.type.includes('image') ? 'image' : 'file-document'} size={24} color="#128C7E" />
              <Text style={styles.attachmentPreviewText} numberOfLines={1}>{attachment.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setAttachment(null)} style={styles.attachmentCloseBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickDocument}>
              <MaterialCommunityIcons name="paperclip" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ketik pesan..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>

          {(inputText.trim().length > 0 || attachment) ? (
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendBtnVoice}>
              <MaterialCommunityIcons name="microphone" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD', // WhatsApp chat background color
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#075E54', // WhatsApp dark green
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: 4,
  },
  mitaHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  headerAction: {
    padding: Spacing.sm,
  },
  chatBackground: {
    flex: 1,
    backgroundColor: '#E5DDD5', // WhatsApp background pattern color
  },
  chatList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    alignItems: 'flex-end',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperMita: {
    justifyContent: 'flex-start',
  },
  mitaAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageBubbleUser: {
    backgroundColor: '#DCF8C6', // WhatsApp user bubble green
    borderBottomRightRadius: 4,
  },
  messageBubbleMita: {
    backgroundColor: '#FFFFFF', // WhatsApp received bubble white
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#303030',
  },
  messageTextMita: {
    color: '#303030',
  },
  attachmentBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  attachmentName: {
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampUser: {
    color: '#999',
  },
  timestampMita: {
    color: '#999',
  },
  typingIndicator: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  typingText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#128C7E',
  },
  attachmentPreviewInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentPreviewText: {
    marginLeft: 10,
    color: '#333',
    flex: 1,
  },
  attachmentCloseBtn: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    backgroundColor: 'transparent',
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: Spacing.sm,
    paddingBottom: 4,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 40,
    maxHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
    marginBottom: 2,
  },
  sendBtnVoice: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
    marginBottom: 2,
  },
});
