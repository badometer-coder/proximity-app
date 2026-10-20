import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

// react-native-ble-plx is a native module — not available in Expo Go
// Wrap in try/catch so app doesn't crash when scanned with Expo Go
let BleManager: any = null;
try {
  const ble = require('react-native-ble-plx');
  BleManager = ble.BleManager;
} catch (e) {
  console.log('BLE not available in this environment (Expo Go)');
}

export const useBluetoothProximity = () => {
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // BLE not available in Expo Go — skip silently
    if (!BleManager) return;

    let manager: any;
    try {
      manager = new BleManager();
    } catch (e) {
      console.log('BleManager init failed:', e);
      return;
    }

    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }

    const subscription = manager.onStateChange((state: string) => {
      if (state === 'PoweredOn') scanForDevices(manager);
    }, true);

    return () => {
      subscription.remove();
      manager.stopDeviceScan();
    };
  }, []);

  const scanForDevices = (manager: any) => {
    setIsScanning(true);
    setDiscoveredDevices([]);

    manager.startDeviceScan(null, null, (error: any, device: any) => {
      if (error) {
        console.error(error);
        return;
      }
      if (device && device.localName) {
        setDiscoveredDevices(prev => {
          if (!prev.find((d: any) => d.id === device.id)) return [...prev, device];
          return prev;
        });
      }
    });
  };

  return { discoveredDevices, isScanning };
};
