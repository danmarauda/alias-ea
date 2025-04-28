import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import Slider from '@/components/forms/Slider';
import Counter from '@/components/forms/Counter';
import FormTabs, { FormTab } from '@/components/forms/FormTabs';
import { Button } from '@/components/Button';
import ThemedScroller from '@/components/ThemeScroller';
import ThemeFooter from '@/components/ThemeFooter';
import Header from '@/components/Header';
import Section from '@/components/layout/Section';
import { Chip } from '@/components/Chip';
import Switch from '@/components/forms/Switch';

export default function FiltersScreen() {
    const router = useRouter();
    const [price, setPrice] = useState(50);
    const [isSellerOnline, setIsSellerOnline] = useState(false);
    const [offersAIModels, setOffersAIModels] = useState(false);

    const handleApplyFilters = () => {
        // Handle applying filters here
        router.back();
    };

    return (
        <>
            <Header showBackButton title="Filters" />
            <ThemedScroller className="flex-1 bg-light-primary dark:bg-dark-primary">
                <Section className='mb-7 pb-7 mt-8 border-b border-light-secondary dark:border-dark-secondary' title="Price" subtitle={`Up to $${price} USD`}>
                    <Slider
                        value={price}
                        onValueChange={setPrice}
                        minValue={100}
                        maxValue={1000}
                        step={5}
                        initialValue={500}
                        size="l"
                        className='mt-2'
                    />
                </Section>
                
                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Style">
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="Modern" size="lg" selectable />
                        <Chip label="Minimalist" size="lg" selectable />
                        <Chip label="Corporate" size="lg" selectable />
                        <Chip label="Creative" size="lg" selectable />
                        <Chip label="E-commerce" size="lg" selectable />
                        <Chip label="Portfolio" size="lg" selectable />
                        <Chip label="Blog" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Services included">
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="Responsive Design" size="lg" selectable />
                        <Chip label="SEO Optimization" size="lg" selectable />
                        <Chip label="Content Creation" size="lg" selectable />
                        <Chip label="Hosting Setup" size="lg" selectable />
                        <Chip label="Custom Features" size="lg" selectable />
                        <Chip label="Maintenance" size="lg" selectable />
                        <Chip label="Analytics" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Language">
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="JavaScript" size="lg" selectable />
                        <Chip label="React" size="lg" selectable />
                        <Chip label="WordPress" size="lg" selectable />
                        <Chip label="PHP" size="lg" selectable />
                        <Chip label="Python" size="lg" selectable />
                        <Chip label="Ruby" size="lg" selectable />
                        <Chip label="HTML/CSS" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Seller level">
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="Beginner" size="lg" selectable />
                        <Chip label="Intermediate" size="lg" selectable />
                        <Chip label="Expert" size="lg" selectable />
                        <Chip label="Top Rated" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Delivery time">
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="1 day" size="lg" selectable />
                        <Chip label="Up to 3 days" size="lg" selectable />
                        <Chip label="Up to 7 days" size="lg" selectable />
                        <Chip label="Up to 14 days" size="lg" selectable />
                        <Chip label="30+ days" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Additional Options">
                    <View className='mt-4 space-y-4'>
                            <Switch 
                                value={isSellerOnline} 
                                onChange={setIsSellerOnline} 
                                label="Seller is currently online"
                            />
                        <Switch 
                                value={offersAIModels} 
                                onChange={setOffersAIModels} 
                                label="Offers AI models"
                            />
                    </View>
                </Section>
            </ThemedScroller>
            <ThemeFooter>
                <Button
                    title="Apply Filters"
                    rounded="full"
                    size="large"
                    className='bg-highlight'
                    textClassName='text-white'
                    onPress={handleApplyFilters}
                />
            </ThemeFooter>
        </>
    );
} 