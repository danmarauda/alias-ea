import React from 'react';
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Expandable from '@/components/Expandable';
import Section from '@/components/layout/Section';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';
import AnimatedView from '@/components/AnimatedView';
import Divider from '@/components/layout/Divider';

// FAQ data
const faqData = [
  {
    id: '1',
    question: 'How do I track my order?',
    answer: 'You can track your order by going to the Orders section in your account. Click on the specific order you want to track, and you will see its current status and tracking information if available.'
  },
  {
    id: '2',
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of purchase. Items must be in their original condition with tags attached. To start a return, go to your Orders section and select the item you wish to return.'
  },
  {
    id: '3',
    question: 'How long does shipping take?',
    answer: 'Standard shipping usually takes 3-5 business days within the continental US. Express shipping is 1-2 business days. International shipping can take 7-14 business days depending on the destination country.'
  },
  {
    id: '4',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary based on the destination. You can see the exact shipping cost during checkout.'
  },
  {
    id: '5',
    question: 'How do I change or cancel my order?',
    answer: 'You can change or cancel your order within 1 hour of placing it. Please contact our customer service team immediately. After this window, your order may have already been processed for shipping.'
  },
  {
    id: '6',
    question: 'Are there any discount codes available?',
    answer: 'We regularly offer promotions and discount codes. You can subscribe to our newsletter to receive updates on our latest deals, or check our social media pages for exclusive offers.'
  }
];

// Contact information
const contactInfo = [
  {
    id: 'email',
    type: 'Email',
    value: 'support@velora.com',
    icon: 'Mail' as const,
    action: () => Linking.openURL('mailto:support@velora.com')
  },
  {
    id: 'phone',
    type: 'Phone',
    value: '+1 (800) 555-1234',
    icon: 'Phone' as const,
    action: () => Linking.openURL('tel:+18005551234')
  },
  {
    id: 'hours',
    type: 'Business Hours',
    value: 'Monday-Friday: 9am-6pm EST',
    icon: 'Clock' as const,
    action: undefined
  }
];

export default function HelpScreen() {
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header title="Help & Support" showBackButton />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedView animation="fadeIn" duration={400}>
          {/* FAQ Section */}
          <Section 
            title="Frequently Asked Questions" 
            titleSize="xl" 
            className="px-global pt-6 pb-2"
          />
          
          <View className="px-global">
            {faqData.map((faq) => (
              <Expandable 
                key={faq.id}
                title={faq.question}
                className="py-1"
              >
                <ThemedText className="text-light-text dark:text-dark-text leading-6">
                  {faq.answer}
                </ThemedText>
              </Expandable>
            ))}
          </View>
          

          
          {/* Contact Section */}
          <Section 
            title="Contact Us" 
            titleSize="xl" 
            className="px-global pb-2 mt-14"
            subtitle="We're here to help with any questions or concerns"
          />
          
          <View className="px-global pb-8">
            {contactInfo.map((contact) => (
              <TouchableOpacity 
                key={contact.id}
                onPress={contact.action}
                disabled={!contact.action}
                className="flex-row items-center py-4 border-b border-light-secondary dark:border-dark-secondary"
              >
                <View className="w-10 h-10 rounded-full bg-light-secondary dark:bg-dark-secondary items-center justify-center mr-4">
                  <Icon name={contact.icon} size={20} />
                </View>
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    {contact.type}
                  </ThemedText>
                  <ThemedText className="font-medium">
                    {contact.value}
                  </ThemedText>
                </View>
                {contact.action && (
                  <Icon name="ChevronRight" size={20} className="ml-auto text-light-subtext dark:text-dark-subtext" />
                )}
              </TouchableOpacity>
            ))}
            
            <Button 
              title="Email Us" 
              iconStart="Mail"
              className="mt-8"
              onPress={() => Linking.openURL('mailto:support@velora.com')}
            />
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}
