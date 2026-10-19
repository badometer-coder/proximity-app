import { useEffect, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

const bleManager = new BleManager();

export const useBluetoothProximity = () => {
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Permission check for Android
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }

    const subscription = bleManager.onStateChange((state) => {
      if (state === 'PoweredOn') scanForDevices();
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    };
  }, []);

  const scanForDevices = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }
      
      if (device && device.localName) {
        setDiscoveredDevices(prev => {
          if (!prev.find(d => d.id === device.id)) return [...prev, device];
          return prev;
        });
      }
    });
  };

  return { discoveredDevices, isScanning };
};