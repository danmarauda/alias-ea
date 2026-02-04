/**
 * Tool Results Component
 * Custom UI for different tool call results
 */

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Linking } from 'react-native';
import Icon from '@/components/Icon';

export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  state: 'pending' | 'running' | 'completed' | 'error';
}

interface ToolResultsProps {
  invocations: ToolInvocation[];
}

export default function ToolResults({ invocations }: ToolResultsProps) {
  return (
    <View style={styles.container}>
      {invocations.map((invocation) => (
        <ToolResultItem key={invocation.toolCallId} invocation={invocation} />
      ))}
    </View>
  );
}

function ToolResultItem({ invocation }: { invocation: ToolInvocation }) {
  const { toolName, args, result, state } = invocation;

  // Render loading state
  if (state === 'pending' || state === 'running') {
    return <LoadingTool toolName={toolName} />;
  }

  // Render error state
  if (state === 'error') {
    return <ErrorTool toolName={toolName} error={result?.error || 'An error occurred'} />;
  }

  // Render specific tool UIs
  switch (toolName) {
    case 'getWeather':
      return <WeatherCard {...args} result={result} />;
    case 'generateDocument':
    case 'generateImage':
      return <DocumentCard result={result} />;
    case 'webSearch':
    case 'search':
      return <SearchResultsCard results={result?.results || []} query={args.query} />;
    case 'codeExecution':
    case 'runCode':
      return <CodeExecutionCard code={args.code} result={result} language={args.language} />;
    case 'fetchUrl':
    case 'browseWeb':
      return <WebPageCard url={args.url} result={result} />;
    default:
      return <GenericToolCard invocation={invocation} />;
  }
}

// Loading state
function LoadingTool({ toolName }: { toolName: string }) {
  return (
    <View style={styles.loadingCard}>
      <View style={styles.loadingIcon}>
        <Icon name="Loader" size={20} color="#3B82F6" />
      </View>
      <View style={styles.loadingContent}>
        <Text style={styles.loadingTitle}>Running {formatToolName(toolName)}</Text>
        <Text style={styles.loadingSubtitle}>Please wait...</Text>
      </View>
    </View>
  );
}

// Error state
function ErrorTool({ toolName, error }: { toolName: string; error: string }) {
  return (
    <View style={styles.errorCard}>
      <View style={styles.errorIcon}>
        <Icon name="AlertCircle" size={20} color="#EF4444" />
      </View>
      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>{formatToolName(toolName)} failed</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    </View>
  );
}

// Weather card
interface WeatherCardProps {
  location?: string;
  result?: {
    temperature?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    icon?: string;
  };
}

function WeatherCard({ location, result }: WeatherCardProps) {
  if (!result) return null;

  const getWeatherIcon = (condition?: string): string => {
    const lower = condition?.toLowerCase() || '';
    if (lower.includes('sun') || lower.includes('clear')) return 'Sun';
    if (lower.includes('cloud')) return 'Cloud';
    if (lower.includes('rain')) return 'CloudRain';
    if (lower.includes('snow')) return 'Snowflake';
    if (lower.includes('thunder')) return 'CloudLightning';
    return 'Cloud';
  };

  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherHeader}>
        <Icon name={getWeatherIcon(result.condition) as any} size={32} color="#F59E0B" />
        <View style={styles.weatherLocation}>
          <Text style={styles.weatherLocationText}>{location || 'Current Location'}</Text>
          <Text style={styles.weatherCondition}>{result.condition}</Text>
        </View>
      </View>
      <View style={styles.weatherBody}>
        <Text style={styles.weatherTemp}>
          {result.temperature !== undefined ? `${result.temperature}°` : '--°'}
        </Text>
        <View style={styles.weatherDetails}>
          {result.humidity !== undefined && (
            <View style={styles.weatherDetail}>
              <Icon name="Droplets" size={14} color="#3B82F6" />
              <Text style={styles.weatherDetailText}>{result.humidity}%</Text>
            </View>
          )}
          {result.windSpeed !== undefined && (
            <View style={styles.weatherDetail}>
              <Icon name="Wind" size={14} color="#3B82F6" />
              <Text style={styles.weatherDetailText}>{result.windSpeed} mph</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// Document/Image card
function DocumentCard({ result }: { result?: { url?: string; id?: string } }) {
  if (!result?.url && !result?.id) {
    return (
      <View style={styles.documentCard}>
        <Icon name="FileText" size={24} color="#3B82F6" />
        <Text style={styles.documentTitle}>Document generated</Text>
      </View>
    );
  }

  return (
    <View style={styles.documentCard}>
      {result.url && (
        <Image source={{ uri: result.url }} style={styles.documentImage} resizeMode="cover" />
      )}
      <View style={styles.documentInfo}>
        <Icon name="FileText" size={18} color="#3B82F6" />
        <Text style={styles.documentTitle}>Generated document</Text>
      </View>
    </View>
  );
}

// Search results card
interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

function SearchResultsCard({ results, query }: { results: SearchResult[]; query?: string }) {
  return (
    <View style={styles.searchCard}>
      <View style={styles.searchHeader}>
        <Icon name="Search" size={18} color="#3B82F6" />
        <Text style={styles.searchQuery} numberOfLines={1}>
          {query ? `Results for "${query}"` : 'Search results'}
        </Text>
      </View>
      <View style={styles.searchResults}>
        {results.slice(0, 3).map((result, index) => (
          <Pressable
            key={index}
            style={styles.searchResult}
            onPress={() => Linking.openURL(result.url)}
          >
            <Text style={styles.searchResultTitle} numberOfLines={1}>
              {result.title}
            </Text>
            {result.snippet && (
              <Text style={styles.searchResultSnippet} numberOfLines={2}>
                {result.snippet}
              </Text>
            )}
            <Text style={styles.searchResultUrl} numberOfLines={1}>
              {result.url}
            </Text>
          </Pressable>
        ))}
        {results.length > 3 && (
          <Text style={styles.searchMore}>+{results.length - 3} more results</Text>
        )}
      </View>
    </View>
  );
}

// Code execution card
function CodeExecutionCard({
  code,
  result,
  language,
}: {
  code?: string;
  result?: { output?: string; error?: string };
  language?: string;
}) {
  return (
    <View style={styles.codeCard}>
      <View style={styles.codeHeader}>
        <Icon name="Terminal" size={16} color="#10B981" />
        <Text style={styles.codeLanguage}>{language || 'Code'} execution</Text>
      </View>
      {code && (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText} numberOfLines={3}>
            {code}
          </Text>
        </View>
      )}
      {result && (
        <View style={[styles.codeOutput, result.error && styles.codeOutputError]}>
          <Text style={styles.codeOutputLabel}>
            {result.error ? 'Error:' : 'Output:'}
          </Text>
          <Text style={styles.codeOutputText}>
            {result.error || result.output || 'No output'}
          </Text>
        </View>
      )}
    </View>
  );
}

// Web page card
function WebPageCard({ url, result }: { url?: string; result?: { title?: string; content?: string } }) {
  return (
    <View style={styles.webCard}>
      <Pressable
        style={styles.webHeader}
        onPress={() => url && Linking.openURL(url)}
      >
        <Icon name="Globe" size={18} color="#3B82F6" />
        <Text style={styles.webTitle} numberOfLines={1}>
          {result?.title || 'Web page'}
        </Text>
        <Icon name="ExternalLink" size={14} color="#6B7280" />
      </Pressable>
      {url && (
        <Text style={styles.webUrl} numberOfLines={1}>
          {url}
        </Text>
      )}
      {result?.content && (
        <Text style={styles.webContent} numberOfLines={3}>
          {result.content}
        </Text>
      )}
    </View>
  );
}

// Generic tool card
function GenericToolCard({ invocation }: { invocation: ToolInvocation }) {
  return (
    <View style={styles.genericCard}>
      <View style={styles.genericHeader}>
        <Icon name="Wrench" size={18} color="#3B82F6" />
        <Text style={styles.genericTitle}>{formatToolName(invocation.toolName)}</Text>
      </View>
      {invocation.result && (
        <View style={styles.genericResult}>
          <Text style={styles.genericResultText} numberOfLines={5}>
            {typeof invocation.result === 'string'
              ? invocation.result
              : JSON.stringify(invocation.result, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}

// Utility function
function formatToolName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  loadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    gap: 2,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContent: {
    flex: 1,
    gap: 2,
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#F87171',
    fontSize: 12,
  },
  // Weather
  weatherCard: {
    padding: 16,
    backgroundColor: 'linear-gradient(135deg, #1E3A5F 0%, #172554 100%)',
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  weatherLocation: {
    flex: 1,
  },
  weatherLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  weatherCondition: {
    color: '#93C5FD',
    fontSize: 13,
  },
  weatherBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherTemp: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '200',
  },
  weatherDetails: {
    gap: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherDetailText: {
    color: '#93C5FD',
    fontSize: 13,
  },
  // Document
  documentCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  documentImage: {
    width: '100%',
    height: 160,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  documentTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Search
  searchCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  searchQuery: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  searchResults: {
    padding: 8,
    gap: 8,
  },
  searchResult: {
    padding: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
  },
  searchResultTitle: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  searchResultSnippet: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  searchResultUrl: {
    color: '#6B7280',
    fontSize: 11,
  },
  searchMore: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
  // Code
  codeCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  codeLanguage: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  codeBlock: {
    padding: 12,
    backgroundColor: '#0D1117',
  },
  codeText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  codeOutput: {
    padding: 12,
    backgroundColor: '#0D1117',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  codeOutputError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  codeOutputLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginBottom: 4,
  },
  codeOutputText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  // Web
  webCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  webUrl: {
    color: '#3B82F6',
    fontSize: 12,
    marginTop: 4,
  },
  webContent: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  // Generic
  genericCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  genericHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  genericTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  genericResult: {
    padding: 12,
  },
  genericResultText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
