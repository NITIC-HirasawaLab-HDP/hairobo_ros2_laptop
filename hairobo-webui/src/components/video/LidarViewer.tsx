import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ROSLIB from 'roslib';

interface Point3D {
	x: number;
	y: number;
	z: number;
	intensity?: number;
}

interface LidarViewerProps {
	points?: Point3D[];
	width?: number;
	height?: number;
	// optional ROS integration: provide ros instance and topic name/type
	ros?: ROSLIB.Ros | null;
	topicName?: string; // default '/lidar_points'
	topicType?: string; // default 'std_msgs/String' (expect JSON array in data)
}

const LidarViewer: React.FC<LidarViewerProps> = ({
	points = [],
	width = 800,
	height = 600,
	ros = null,
	topicName = '/lidar_points',
	topicType = 'std_msgs/String',
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const pointCloudRef = useRef<THREE.Points | null>(null);
	// internal state for points (can be driven by props.points or ROS messages)
	const [pointsState, setPointsState] = useState<Point3D[]>(points);

	useEffect(() => {
		if (!containerRef.current) return;

		// シーンの初期化
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x1a1a1a);
		sceneRef.current = scene;

		// カメラの設定
		const camera = new THREE.PerspectiveCamera(
			75,
			width / height,
			0.1,
			1000
		);
		camera.position.set(5, 5, 5);
		camera.lookAt(0, 0, 0);
		cameraRef.current = camera;

		// レンダラーの設定
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(width, height);
		containerRef.current.appendChild(renderer.domElement);
		rendererRef.current = renderer;

		// OrbitControlsの設定
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controlsRef.current = controls;

		// グリッドヘルパーの追加
		const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
		scene.add(gridHelper);

		// 軸ヘルパーの追加
		const axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);

		// ロボットの表示（簡易的な箱）
		const robotGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.7);
		const robotMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
		const robot = new THREE.Mesh(robotGeometry, robotMaterial);
		robot.position.y = 0.15;
		scene.add(robot);

		// ライトの追加
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(10, 10, 10);
		scene.add(directionalLight);

		// アニメーションループ
		const animate = () => {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};
		animate();

		// クリーンアップ
		return () => {
			renderer.dispose();
			containerRef.current?.removeChild(renderer.domElement);
		};
	}, [width, height]);

	// update internal state when props.points changes
	useEffect(() => {
		setPointsState(points);
	}, [points]);

	// optional ROS subscription to receive JSON point arrays (std_msgs/String expected)
	useEffect(() => {
		if (!ros) return;
		const topic = new ROSLIB.Topic({
			ros,
			name: topicName,
			messageType: topicType,
		});

		const callback = (msg: any) => {
			try {
				// If message carries JSON in data field (std_msgs/String)
				if (typeof msg.data === 'string') {
					const parsed = JSON.parse(msg.data);
					if (Array.isArray(parsed)) setPointsState(parsed);
					return;
				}
				// If message already contains points array
				if (Array.isArray(msg.points)) {
					setPointsState(msg.points);
					return;
				}
			} catch (e) {
				// ignore parse errors
			}
		};

		topic.subscribe(callback);
		return () => {
			try {
				topic.unsubscribe(callback);
			} catch (e) {
				// ignore
			}
		};
	}, [ros, topicName, topicType]);

	// render/update point cloud from internal pointsState
	useEffect(() => {
		if (!sceneRef.current || pointsState.length === 0) return;

		// 既存の点群を削除
		if (pointCloudRef.current) {
			sceneRef.current.remove(pointCloudRef.current);
			pointCloudRef.current.geometry.dispose();
			(pointCloudRef.current.material as THREE.Material).dispose();
		}

		// 点群データから頂点を作成
		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(pointsState.length * 3);
		const colors = new Float32Array(pointsState.length * 3);

		pointsState.forEach((point, i) => {
			positions[i * 3] = point.x;
			positions[i * 3 + 1] = point.y;
			positions[i * 3 + 2] = point.z;

			// 強度に基づいた色付け（オプション）
			const intensity = point.intensity ?? 1.0;
			colors[i * 3] = intensity;
			colors[i * 3 + 1] = intensity;
			colors[i * 3 + 2] = intensity;
		});

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

		// 点群マテリアルの作成
		const material = new THREE.PointsMaterial({
			size: 0.05,
			vertexColors: true,
		});

		// 点群オブジェクトの作成
		const pointCloud = new THREE.Points(geometry, material);
		sceneRef.current.add(pointCloud);
		pointCloudRef.current = pointCloud;
	}, [pointsState]);

	return (
		<div
			ref={containerRef}
			style={{
				width: `${width}px`,
				height: `${height}px`,
				border: '1px solid #333',
			}}
		/>
	);
};

export default LidarViewer;
