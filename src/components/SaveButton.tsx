import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToggleFavorite } from '../hooks/useDaycares';
import { useAuth } from '../context/AuthContext';

interface Props {
  daycareId: string;
}

export default function SaveButton({ daycareId }: Props) {
  const { isAuthenticated } = useAuth();
  const toggle = useToggleFavorite();
  const [isSaved, setIsSaved] = useState(false);

  const handlePress = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to save daycares.');
      return;
    }
    setIsSaved(!isSaved);
    toggle.mutate({ daycareId, isSaved });
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={24} color={isSaved ? '#ef4444' : '#94a3b8'} />
    </TouchableOpacity>
  );
}
