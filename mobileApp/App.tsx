import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { WebView } from 'react-native-webview';
import { useCloudMessaging } from '@/hooks'

export default function App() {
  const { notification } = useCloudMessaging();
  const pushNotification = notification?.request?.content || notification;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" hidden />

      <View style={styles.content}>
        <Text>Title: {pushNotification?.title} </Text>
        <Text>Body: {pushNotification?.body}</Text>
        <Text>Data: {notification?.data && JSON.stringify(notification.data)}</Text>
      </View>

      <View style={styles.webView}>
        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>BROWSER:</Text>
        <WebView
          source={{ uri: 'https://lutsk.inbestme.com' }}
          scalesPageToFit
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          nestedScrollEnabled
          allowsInlineMediaPlayback
          cacheEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  webView: {
    flex: 0.5,
    margin: 20,
    borderWidth: 1,
    borderColor: 'red',
    borderStyle: 'solid'
  },
});
