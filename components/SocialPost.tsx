import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, TextInput, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Share } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ThemedText from './ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import ImageCarousel from './ImageCarousel';
import ActionSheetThemed from './ActionSheetThemed';
import { ActionSheetRef } from 'react-native-actions-sheet';
import Avatar from './Avatar';

interface Comment {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    text: string;
    likes: number;
    timestamp: string;
}

interface SocialPostProps {
    id: string;
    user: {
        name: string;
        avatar: string;
        id: string;
    };
    timestamp: string;
    description: string;
    images?: string[];
    likes: number;
    comments: Comment[];
    className?: string;
}

const SocialPost: React.FC<SocialPostProps> = ({
    id,
    user,
    timestamp,
    description,
    images,
    likes,
    comments,
    className = '',
}) => {
    const colors = useThemeColors();
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const actionSheetRef = React.useRef<ActionSheetRef>(null);
    const commentsActionSheetRef = React.useRef<ActionSheetRef>(null);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this post by ${user.name}: ${description}`,
                title: 'Share Post'
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleComment = () => {
        commentsActionSheetRef.current?.show();
    };

    const handlePostComment = () => {
        if (newComment.trim()) {
            // Here you would typically make an API call to post the comment
            setNewComment('');
        }
    };

    const renderComments = () => (
        <View className="px-4 pb-8 pt-4">
            <View className="flex-row justify-between items-center mb-4">
                <ThemedText className="text-lg font-bold">Comments</ThemedText>
                <TouchableOpacity onPress={() => commentsActionSheetRef.current?.hide()}>
                    <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 bg-black h-full">
                {comments.map((comment) => (
                    <View key={comment.id} className="flex-row mb-4">
                        <Avatar src={user.avatar} size="sm" className="mr-2" />
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <ThemedText className="font-semibold">{comment.user.name}</ThemedText>
                                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext ml-2">
                                    {comment.timestamp}
                                </ThemedText>
                            </View>
                            <ThemedText className="mt-1">{comment.text}</ThemedText>
                            <View className="flex-row items-center mt-1">
                                <TouchableOpacity className="flex-row items-center">
                                    <MaterialIcons name="favorite-border" size={16} color={colors.text} />
                                    <ThemedText className="text-sm ml-1">{comment.likes}</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View className="flex-row items-center mt-4">
                <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.placeholder}
                    className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-full px-4 py-2 mr-2"
                />
                <TouchableOpacity onPress={handlePostComment}>
                    <ThemedText className="font-semibold text-blue-500">Post</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className={`bg-light-primary dark:bg-dark-primary mb-2 ${className}`}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4">
                <Link href={`/profile/${user.id}`} asChild>
                    <TouchableOpacity className="flex-row items-center">
                        <Avatar src={user.avatar} size="sm" className="mr-2" />
                        <View>
                            <ThemedText className="font-semibold">{user.name}</ThemedText>
                            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                                {timestamp}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={() => actionSheetRef.current?.show()}>
                    <MaterialIcons name="more-vert" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {images && images.length > 0 && (
                <ImageCarousel
                    images={images}
                    height={400}
                    className="w-full"
                />
            )}

            {/* Actions */}
            <View className="p-4">
                <ThemedText className='mb-6'>
                    <ThemedText className="font-semibold">{user.name}</ThemedText> {description}
                </ThemedText>
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={handleLike} className="mr-4">
                        <MaterialIcons
                            name={isLiked ? "favorite" : "favorite-border"}
                            size={24}
                            color={isLiked ? "#ff4d4d" : colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleComment} className="mr-4">
                        <MaterialIcons name="chat-bubble-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare}>
                        <MaterialIcons name="share" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <ThemedText className="font-semibold mb-2">{likes} likes</ThemedText>

            </View>

            {/* Action Sheets */}
            <ActionSheetThemed
                ref={actionSheetRef}
                gestureEnabled
                containerStyle={{
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20
                }}
            >
                <View className="px-4 pb-8 pt-4">
                    <TouchableOpacity className="py-3">
                        <ThemedText>Follow {user.name}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-3">
                        <ThemedText>Message {user.name}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-3">
                        <ThemedText className="text-red-500">Report</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-3">
                        <ThemedText className="text-red-500">Block {user.name}</ThemedText>
                    </TouchableOpacity>
                </View>
            </ActionSheetThemed>

            <ActionSheetThemed
                ref={commentsActionSheetRef}
                gestureEnabled
                containerStyle={{
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    height: '90%'
                }}
            >
                {renderComments()}
            </ActionSheetThemed>
        </View>
    );
};

export default SocialPost; 