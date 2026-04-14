import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Platform, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import PushNotification from "react-native-push-notification";

export default function ReminderScreen() {
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [webHour, setWebHour] = useState(time.getHours());
  const [webMinute, setWebMinute] = useState(time.getMinutes());

  useEffect(() => {
    if (Platform.OS !== "web") {
      PushNotification.createChannel(
        { channelId: "reminder-channel", channelName: "Reminder Channel" },
        (created) => console.log("Channel created:", created)
      );
    }
    if (Platform.OS === "web" && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const setReminder = () => {
    let reminderTime = new Date(time);
    const now = new Date();

    if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1);

    const delay = reminderTime.getTime() - now.getTime();
    console.log("Delay:", delay);

    if (Platform.OS !== "web") {
      PushNotification.localNotificationSchedule({
        channelId: "reminder-channel",
        message: "⏰ Time reached!",
        date: reminderTime,
      });
      const beforeTime = new Date(reminderTime.getTime() - 10 * 60000);
      PushNotification.localNotificationSchedule({
        channelId: "reminder-channel",
        message: "⚠️ 10 minutes left!",
        date: beforeTime,
      });
    } else {
      if (Notification.permission === "granted") {
        setTimeout(() => new Notification("⏰ Time reached!"), delay);
        const beforeDelay = delay - 10 * 60000;
        if (beforeDelay > 0) setTimeout(() => new Notification("⚠️ 10 minutes left!"), beforeDelay);
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") setTimeout(() => new Notification("⏰ Time reached!"), delay);
          else alert("Notification permission denied ❌");
        });
      }
    }

    alert("Reminder Set ✅");
  };

  const handleWebTimeChange = () => {
    const newDate = new Date(time);
    newDate.setHours(Number(webHour), Number(webMinute), 0, 0);
    setTime(newDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏰ Set Reminder</Text>
      <Text style={styles.timeText}>Selected Time: {time.toLocaleString()}</Text>

      {Platform.OS === "web" ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={2}
            value={webHour.toString()}
            onChangeText={(v) => setWebHour(v)}
            placeholder="HH"
          />
          <Text>:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={2}
            value={webMinute.toString()}
            onChangeText={(v) => setWebMinute(v)}
            placeholder="MM"
          />
          <Button title="Set Time" onPress={handleWebTimeChange} />
        </View>
      ) : (
        <>
          <Button title="Select Time ⏱" onPress={() => setShow(true)} />
          {show && (
            <DateTimePicker
              value={time}
              mode="time"
              onChange={(event, selectedDate) => {
                setShow(false);
                if (selectedDate) setTime(selectedDate);
              }}
            />
          )}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="SET REMINDER 🔔" onPress={setReminder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  timeText: { fontSize: 18, marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    width: 50,
    textAlign: "center",
  },
});