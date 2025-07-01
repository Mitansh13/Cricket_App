import React, { useEffect, useRef, useState } from "react"
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	Platform,
	PanResponder,
	Dimensions,
	Modal,
	TextInput,
	ScrollView,
} from "react-native"
import axios from "axios"
import * as FileSystem from "expo-file-system"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Video } from "expo-av"
import { Entypo } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import Header from "./Header_1"

import { useSelector } from "react-redux"

import { styles } from "@/styles/recordVideoStyle"
import { RootState } from "@/store/store"

type Params = { coachId: string }
type RecordedVideo = { uri: string }

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function RecordVideoScreen() {
	const router = useRouter()
	const { coachId, studentEmail } = useLocalSearchParams<
		Params & { studentEmail?: string }
	>()
	const loggedInUserEmail = useSelector((state: RootState) => state.user.email)
	const isCoach = useSelector((state: RootState) => state.user.role) === "Coach"

	const assignedCoachId = isCoach ? loggedInUserEmail : coachId
	const targetStudent = isCoach ? studentEmail || "" : loggedInUserEmail

	const cameraRef = useRef<CameraView>(null)
	const [permission, requestPermission] = useCameraPermissions()
	const [isRecording, setIsRecording] = useState(false)
	const [isReady, setIsReady] = useState(false)

	const [zoom, setZoom] = useState(0)
	const [recordingTime, setRecordingTime] = useState(0)
	const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null
	)
	const userEmail = useSelector((state: RootState) => state.user.email)
	const [initialDistance, setInitialDistance] = useState(0)
	const [initialZoom, setInitialZoom] = useState(0)
	const [showZoomSlider, setShowZoomSlider] = useState(false)
	const zoomSliderTimeout = useRef<number | null>(null)
	const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null)
	const [showPreview, setShowPreview] = useState(false)
	
	// New state for video details
	const [videoTitle, setVideoTitle] = useState("")
	const [videoDescription, setVideoDescription] = useState("")
	const [isUploading, setIsUploading] = useState(false)

	console.log("📍 Screen opened: RecordVideoScreen")
	console.log("🔑 Route Params - coachId:", coachId)
	console.log("🔑 Route Params - studentEmail:", studentEmail)
	console.log("👤 Logged-in User Email:", loggedInUserEmail)
	console.log("👥 Role (isCoach):", isCoach)
	console.log("📩 assignedCoachId (coach email):", assignedCoachId)
	console.log("🎯 targetStudent (recordedFor):", targetStudent)

	const notifyCoach = async ({
		coachId,
		videoId,
		studentName,
	}: {
		coachId: string
		videoId: string
		studentName?: string
	}) => {
		try {
			const response = await axios.post(
				"https://becomebetter-api.azurewebsites.net/api/notifycoach",
				{
					coachId,
					videoId,
					studentName,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			)

			console.log("✅ Notification sent:", response.data)
		} catch (error) {
			console.error("❌ Notification error:", error)
		}
	}

	const handleVideoUpload = async (
		videoUri: string,
		uploadedBy: string,
		assignedCoachId: string,
		filename: string,
		recordedFor: string,
		durationSeconds: number,
		title: string,
		description: string,
		onSuccess: () => void,
		onFailure: () => void,
		studentName?: string
	) => {
		try {
			setIsUploading(true)
			const base64 = await FileSystem.readAsStringAsync(videoUri, {
				encoding: FileSystem.EncodingType.Base64,
			})

			const response = await fetch(
				"https://becomebetter-api.azurewebsites.net/api/UploadVideo",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						videoData: base64,
						filename,
						uploadedBy,
						assignedCoachId,
						recordedFor,
						durationSeconds,
						title,
						description,
					}),
				}
			)

			const resText = await response.text()
			console.log("Status:", response.status)
			console.log("Response body:", resText)

			if (!response.ok) throw new Error("Upload failed")

			let result: { videoId?: string } = {}
			try {
				result = JSON.parse(resText)
				console.log("✅ Upload success:", result)
			} catch (e) {
				console.warn("⚠️ Response is not valid JSON:", resText)
			}

			if (result.videoId) {
				await notifyCoach({
					coachId: assignedCoachId,
					videoId: result.videoId,
					studentName,
				})
			} else {
				console.warn("⚠️ Missing videoId in upload response")
			}

			Alert.alert("Success", "Video uploaded successfully!")
			onSuccess()
		} catch (error) {
			console.error("❌ Upload error:", error)
			Alert.alert("Error", "Failed to upload video. Try again.")
			onFailure()
		} finally {
			setIsUploading(false)
		}
	}

	const getDistance = (touches: any[]) => {
		if (touches.length < 2) return 0
		const [touch1, touch2] = touches
		const dx = touch1.pageX - touch2.pageX
		const dy = touch1.pageY - touch2.pageY
		return Math.sqrt(dx * dx + dy * dy)
	}

	const showZoomSliderTemporarily = () => {
		setShowZoomSlider(true)
		if (zoomSliderTimeout.current) {
			clearTimeout(zoomSliderTimeout.current)
		}
		zoomSliderTimeout.current = setTimeout(() => {
			setShowZoomSlider(false)
		}, 2000)
	}

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderGrant: (evt) => {
			const touches = evt.nativeEvent.touches
			if (touches.length === 2) {
				const distance = getDistance(touches)
				setInitialDistance(distance)
				setInitialZoom(zoom)
				showZoomSliderTemporarily()
			} else if (touches.length === 1) {
				showZoomSliderTemporarily()
			}
		},
		onPanResponderMove: (evt, gestureState) => {
			const touches = evt.nativeEvent.touches
			if (touches.length === 2 && initialDistance > 0) {
				const currentDistance = getDistance(touches)
				const distanceRatio = currentDistance / initialDistance
				const zoomChange = (distanceRatio - 1) * 0.5
				const newZoom = Math.max(0, Math.min(1, initialZoom + zoomChange))
				setZoom(newZoom)
			} else if (touches.length === 1) {
				const verticalMovement = -gestureState.dy
				const zoomSensitivity = 0.003
				const zoomChange = verticalMovement * zoomSensitivity
				const newZoom = Math.max(0, Math.min(1, zoom + zoomChange))
				setZoom(newZoom)
			}
		},
		onPanResponderRelease: () => {
			setInitialDistance(0)
			setInitialZoom(0)
		},
	})

	useEffect(() => {
		return () => {
			stopRecordingTimer()
			if (zoomSliderTimeout.current) {
				clearTimeout(zoomSliderTimeout.current)
			}
		}
	}, [])

	useEffect(() => {
		const requestCameraPermission = async () => {
			if (!permission) return
			if (!permission.granted) {
				const { granted } = await requestPermission()
				if (!granted) {
					Alert.alert(
						"Camera Permission Required",
						"Please enable camera access to record videos.",
						[{ text: "OK" }]
					)
				}
			}
		}

		requestCameraPermission()
	}, [permission, requestPermission])

	const startRecordingTimer = () => {
		setRecordingTime(0)
		recordingIntervalRef.current = setInterval(() => {
			setRecordingTime((prev) => {
				const newTime = prev + 1
				if (newTime >= 5) {
					handleStopRecording(newTime)
				}
				return newTime
			})
		}, 1000)
	}

	const stopRecordingTimer = () => {
		if (recordingIntervalRef.current) {
			clearInterval(recordingIntervalRef.current)
			recordingIntervalRef.current = null
		}
	}

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`
	}

	const handleRecord = async () => {
		if (!cameraRef.current || isRecording || !isReady) return
		if (!permission?.granted) {
			Alert.alert("Error", "Camera permission is required to record videos.")
			return
		}

		setIsRecording(true)
		startRecordingTimer()

		try {
			let recordingOptions: any = { maxDuration: 5 }
			if (Platform.OS === "ios") {
				recordingOptions = { ...recordingOptions, quality: "720p", mute: false }
			} else {
				recordingOptions = { ...recordingOptions, quality: "medium" }
			}

			const video = await cameraRef.current.recordAsync(recordingOptions)
			setRecordedVideoUri(video?.uri ?? null)
			setShowPreview(true)
		} catch (error: any) {
			Alert.alert(
				"Recording Error",
				error.message || "Could not record video. Please try again."
			)
		} finally {
			setIsRecording(false)
			stopRecordingTimer()
		}
	}

	const handleStopRecording = async (timeFromTimer?: number) => {
		if (!cameraRef.current || !isRecording) return

		try {
			const finalTime = timeFromTimer || recordingTime

			await cameraRef.current.stopRecording()

			setShowPreview(true)
		} catch (error: any) {
			console.error("Stop recording error:", error)
		} finally {
			setIsRecording(false)
			stopRecordingTimer()
		}
	}

	const setZoomLevel = (level: number) => {
		setZoom(level)
		showZoomSliderTemporarily()
	}

	const handleRecordButtonPress = () => {
		if (isRecording) {
			handleStopRecording()
		} else {
			handleRecord()
		}
	}

	const handleSubmitVideo = () => {
		if (!videoTitle.trim()) {
			Alert.alert("Error", "Please enter a video title")
			return
		}
		if (!videoDescription.trim()) {
			Alert.alert("Error", "Please enter a description")
			return
		}
		if (recordedVideoUri) {
			const timestamp = Date.now()
			const filename = `${targetStudent.replace(
				/[@.]/g,
				"_"
			)}_${timestamp}.mp4`

			handleVideoUpload(
				recordedVideoUri,
				loggedInUserEmail,
				assignedCoachId,
				filename,
				targetStudent,
				recordingTime,
				videoTitle,
				videoDescription,
				() => {
					setShowPreview(false)
					setVideoTitle("")
					setVideoDescription("")
				},
				() => {}
			)
		}
	}

	const handleBackToRecord = () => {
		setShowPreview(false)
		setVideoTitle("")
		setVideoDescription("")
	}

	if (!permission) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>Loading camera...</Text>
			</View>
		)
	}

	if (!permission.granted) {
		return (
			<View style={styles.center}>
				<Text style={styles.permissionText}>
					Camera access is required to record videos
				</Text>
				<TouchableOpacity
					onPress={requestPermission}
					style={styles.permissionButton}
				>
					<Text style={styles.permissionButtonText}>
						Grant Camera Permission
					</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Header title="Record Video" />

			<View style={{ flex: 1, position: "relative" }}>
				<CameraView
					ref={cameraRef}
					style={styles.cameraPreview}
					facing="back"
					zoom={zoom}
					mode="video"
					onCameraReady={() => setIsReady(true)}
					onMountError={(error) =>
						Alert.alert(
							"Camera Error",
							"Failed to initialize camera: " + error.message
						)
					}
				/>

				<View
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "transparent",
					}}
					{...panResponder.panHandlers}
				/>

				{(showZoomSlider || zoom > 0) && (
					<View
						style={{
							position: "absolute",
							top: 50,
							right: 20,
							backgroundColor: "rgba(0, 0, 0, 0.7)",
							paddingHorizontal: 12,
							paddingVertical: 8,
							borderRadius: 20,
							minWidth: 60,
							alignItems: "center",
						}}
					>
						<Text
							style={{
								color: "white",
								fontSize: 14,
								fontWeight: "bold",
								textAlign: "center",
							}}
						>
							{zoom === 0 ? "1x" : `${(1 + zoom * 4).toFixed(1)}x`}
						</Text>
					</View>
				)}

				{isRecording && (
					<View
						style={{
							position: "absolute",
							top: 20,
							left: 0,
							right: 0,
							alignItems: "center",
						}}
					>
						<View
							style={{
								backgroundColor: "rgba(255, 0, 0, 0.8)",
								paddingHorizontal: 16,
								paddingVertical: 8,
								borderRadius: 20,
								flexDirection: "row",
								alignItems: "center",
							}}
						>
							<View
								style={{
									width: 8,
									height: 8,
									backgroundColor: "white",
									borderRadius: 4,
									marginRight: 8,
								}}
							/>
							<Text
								style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
							>
								REC {formatTime(recordingTime)}
							</Text>
						</View>
					</View>
				)}
			</View>

			<View style={styles.controls}>
				<View
					style={{
						flexDirection: "row",
						marginBottom: 20,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{[
						{ level: 0, label: "1x" },
						{ level: 0.25, label: "2x" },
						{ level: 0.5, label: "3x" },
						{ level: 1, label: "5x" },
					].map((item, idx) => (
						<TouchableOpacity
							key={idx}
							onPress={() => setZoomLevel(item.level)}
							style={[
								quickZoomButtonStyle,
								Math.abs(zoom - item.level) < 0.05 && {
									backgroundColor: "rgba(255, 255, 255, 0.3)",
								},
							]}
						>
							<Text style={quickZoomTextStyle}>{item.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				<TouchableOpacity
					onPress={handleRecordButtonPress}
					disabled={!isReady}
					style={[
						styles.recordButton,
						isRecording && styles.recordButtonActive,
						!isReady && styles.recordButtonDisabled,
					]}
				>
					{isRecording ? (
						<Entypo name="controller-stop" size={36} color="#fff" />
					) : (
						<Entypo name="controller-record" size={36} color="#fff" />
					)}
				</TouchableOpacity>
			</View>

			{/* Video Preview Modal with Form */}
			<Modal
				visible={showPreview}
				animationType="slide"
				presentationStyle="fullScreen"
				onRequestClose={() => setShowPreview(false)}
			>
				<View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
					<View style={modalHeaderStyles.header}>
	<TouchableOpacity 
		onPress={() => setShowPreview(false)}
	>
		<Entypo name="chevron-left" size={30} color="#1D4ED8" />
	</TouchableOpacity>
	<Text style={modalHeaderStyles.title}>
		Video Details
	</Text>
	<View style={{ width: 30 }} /> {/* For symmetrical spacing */}
</View>

					<View style={{ flex: 1, marginTop: 100 }}>
						{recordedVideoUri && (
							<Video
								source={{ uri: recordedVideoUri }}
								style={{ height: 200 }}
								useNativeControls
								isLooping
								shouldPlay={false}
							/>
						)}

						<ScrollView style={{ flex: 1, padding: 20 }}>
							<View style={{ marginBottom: 20 }}>
								<Text style={{ color: "#333", fontSize: 16, marginBottom: 8, fontWeight: "bold" }}>
									Video Title *
								</Text>
								<TextInput
									style={{
										backgroundColor: "white",
										padding: 12,
										borderRadius: 8,
										fontSize: 16,
										color: "black",
										borderWidth: 1,
										borderColor: "#ddd",
									}}
									placeholder="Enter video title..."
									placeholderTextColor="#666"
									value={videoTitle}
									onChangeText={setVideoTitle}
									multiline={false}
								/>
							</View>

							<View style={{ marginBottom: 30 }}>
								<Text style={{ color: "#333", fontSize: 16, marginBottom: 8, fontWeight: "bold" }}>
									Short Description of the Shot *
								</Text>
								<TextInput
									style={{
										backgroundColor: "white",
										padding: 12,
										borderRadius: 8,
										fontSize: 16,
										color: "black",
										minHeight: 100,
										textAlignVertical: "top",
										borderWidth: 1,
										borderColor: "#ddd",
									}}
									placeholder="Describe the shot you played..."
									placeholderTextColor="#666"
									value={videoDescription}
									onChangeText={setVideoDescription}
									multiline={true}
									numberOfLines={4}
								/>
							</View>
						</ScrollView>
					</View>

					<View
						style={{
							position: "absolute",
							bottom: 50,
							left: 20,
							right: 20,
							flexDirection: "row",
							justifyContent: "space-around",
						}}
					>
						<TouchableOpacity
							onPress={handleSubmitVideo}
							disabled={isUploading || !videoTitle.trim() || !videoDescription.trim()}
							style={{
								backgroundColor: (!videoTitle.trim() || !videoDescription.trim() || isUploading) 
									? "rgba(128, 128, 128, 0.5)" 
									: "rgba(0, 128, 0, 0.9)",
								paddingHorizontal: 24,
								paddingVertical: 12,
								borderRadius: 25,
								flexDirection: "row",
								alignItems: "center",
								opacity: (!videoTitle.trim() || !videoDescription.trim() || isUploading) ? 0.6 : 1,
							}}
						>
							{isUploading ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Entypo name="check" size={20} color="white" />
							)}
							<Text
								style={{ 
									color: "white", 
									marginLeft: 8, 
									fontWeight: "bold",
									fontSize: 16
								}}
							>
								{isUploading ? "Uploading..." : "Submit Video"}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handleBackToRecord}
							disabled={isUploading}
							style={{
								backgroundColor: "rgba(255, 0, 0, 0.9)",
								paddingHorizontal: 24,
								paddingVertical: 12,
								borderRadius: 25,
								flexDirection: "row",
								alignItems: "center",
								opacity: isUploading ? 0.6 : 1,
							}}
						>
							<Entypo name="controller-record" size={20} color="white" />
							<Text
								style={{ color: "white", marginLeft: 8, fontWeight: "bold", fontSize: 16 }}
							>
								Record Again
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	)
}

const quickZoomButtonStyle = {
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	paddingHorizontal: 16,
	paddingVertical: 8,
	borderRadius: 20,
	marginHorizontal: 5,
	minWidth: 45,
	alignItems: "center" as const,
}

const quickZoomTextStyle = {
	color: "black",
	fontSize: 14,
	fontWeight: "bold" as const,
}
const modalHeaderStyles = StyleSheet.create({
	header: {
		backgroundColor: "#fff",
		color: "#000",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 50,
		paddingBottom: 12,
		paddingHorizontal: 20,
		position: "absolute" as const,
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	title: {
		color: "#1D4ED8",
		fontSize: 20,
		fontWeight: "600",
		textAlign: "center",
	},
})