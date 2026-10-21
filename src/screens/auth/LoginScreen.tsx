
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/auth/useAuth';
export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn: signInEmail, signUp, signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    if (error) Alert.alert('Google Login Failed', error.message);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInEmail(email, password); 
    setIsLoading(false);
    if (error) Alert.alert('Login Failed', error.message);
  };

  const handleSignup = async () => {
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    if (error) Alert.alert('Signup Failed', error.message);
    else Alert.alert('Success', 'Check your email for confirmation (if enabled).');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Proximity</Text>
        <Text style={styles.subtitle}>Find people nearby</Text>

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>Sign In with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleSignup} disabled={isLoading}>
          <Text style={styles.buttonTextOutline}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  inner: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 32 
  },
  title: { 
    fontSize: 42, 
    fontWeight: '800', 
    color: theme.colors.primary.main, 
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 16, 
    color: theme.colors.text.secondary, 
    marginBottom: 48, 
    textAlign: 'center',
    opacity: 0.8
  },
  input: { 
    backgroundColor: '#F3F4F6', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 16, 
    padding: 18, 
    fontSize: 16, 
    marginBottom: 20, 
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  buttonOutline: {
    backgroundColor: '#FF3B30', 
    borderWidth: 0,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  buttonTextOutline: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
});