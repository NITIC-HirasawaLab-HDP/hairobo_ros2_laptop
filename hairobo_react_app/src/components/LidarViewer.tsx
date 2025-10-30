import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ROSLIB from 'roslib';

const CAMERA_INITIAL_POSITION = { x: 3, y: 3, z: 2 };
const CAMERA_LOOK_AT = { x: 0, y: 0, z: 0 };
const ROBOT_BOX_SIZE = { width: 0.5, height: 0.3, depth: 0.2 };
const ROBOT_BOX_COLOR = 0x00ff00;

interface LidarViewerProps {
    ros: ROSLIB.Ros | null;
}

const LidarViewer: React.FC<LidarViewerProps> = ({ ros }) => {
    const viewerContainerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const container = viewerContainerRef.current;
        if (!container) return;

        console.log('LidarViewer: 3Dビューア初期化開始');

        try {
            const containerWidth = container.clientWidth || 640;
            const containerHeight = container.clientHeight || 480;

            // Three.jsシーンの初期化
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x222222);
            sceneRef.current = scene;

            // カメラの初期化
            const camera = new THREE.PerspectiveCamera(
                75,
                containerWidth / containerHeight,
                0.1,
                1000
            );
            camera.position.set(
                CAMERA_INITIAL_POSITION.x,
                CAMERA_INITIAL_POSITION.y,
                CAMERA_INITIAL_POSITION.z
            );
            camera.lookAt(new THREE.Vector3(
                CAMERA_LOOK_AT.x,
                CAMERA_LOOK_AT.y,
                CAMERA_LOOK_AT.z
            ));
            cameraRef.current = camera;

            // レンダラーの初期化
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(containerWidth, containerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // ライティングの設定
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // グリッドの追加
            const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
            scene.add(gridHelper);

            // ロボットモデル（箱）の作成
            const boxGeometry = new THREE.BoxGeometry(
                ROBOT_BOX_SIZE.width,
                ROBOT_BOX_SIZE.height,
                ROBOT_BOX_SIZE.depth
            );
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: ROBOT_BOX_COLOR
            });
            const robotBox = new THREE.Mesh(boxGeometry, boxMaterial);
            robotBox.position.set(0, 0, ROBOT_BOX_SIZE.depth / 2);
            robotBox.castShadow = true;
            scene.add(robotBox);

            // レンダリングループ
            const animate = () => {
                if (rendererRef.current && sceneRef.current && cameraRef.current) {
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                    animationFrameRef.current = requestAnimationFrame(animate);
                }
            };
            animate();

            console.log('LidarViewer: 3Dビューア初期化完了');

        } catch (error) {
            console.error('LidarViewer: 初期化エラー', error);
            if (container) {
                container.innerHTML = '<div>3Dビューアの初期化に失敗しました</div>';
            }
        }

        return () => {
            console.log('LidarViewer: 3Dビューアのクリーンアップ');
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            const currentContainer = viewerContainerRef.current;

            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current = null;
            }

            if (currentContainer) {
                currentContainer.innerHTML = '';
            }

            sceneRef.current = null;
            cameraRef.current = null;
        };
    }, []);

    return <div ref={viewerContainerRef} className="w-full h-full" />;
};

export default LidarViewer;
