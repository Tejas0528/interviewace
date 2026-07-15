"""
WebSocket endpoint for streaming agent status updates in real-time.
Frontend connects to ws://localhost:8000/ws/{session_id}
"""
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import Dict
import json
import asyncio

router = APIRouter()

# Active WebSocket connections: session_id -> websocket
connections: Dict[str, WebSocket] = {}


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    connections[session_id] = websocket

    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "message": "Connected to InterviewAce AI",
        })

        while True:
            # Keep connection alive with ping-pong
            data = await asyncio.wait_for(websocket.receive_text(), timeout=30)
            msg = json.loads(data)

            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        connections.pop(session_id, None)
    except asyncio.TimeoutError:
        # Send keep-alive
        try:
            await websocket.send_json({"type": "keepalive"})
        except Exception:
            connections.pop(session_id, None)
    except Exception:
        connections.pop(session_id, None)


async def broadcast_agent_update(session_id: str, agent_name: str, status: str, message: str = "", progress: int = None):
    """Broadcast agent status to connected client."""
    ws = connections.get(session_id)
    if not ws:
        return

    payload = {
        "type": "agent_update",
        "agent": agent_name,
        "status": status,
        "message": message,
    }
    if progress is not None:
        payload["progress"] = progress

    try:
        await ws.send_json(payload)
    except Exception:
        connections.pop(session_id, None)
