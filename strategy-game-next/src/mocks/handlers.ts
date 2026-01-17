// src/mocks/handlers.ts
import { http } from 'msw';
import { Match } from "../models/Match";
import { Board } from "../models/Board";
import { Player } from "../models/Player";
import { User } from "../models/User";
import { ChatMessage, AIRecommendation } from "../models/Chat";

const API_GAME = "/api";
const API_USERS = "/api/users";
const CHAT_API = "/api/chat";

// In-memory storage
let matches: Match[] = [];
let boards: Record<number, Board> = {};
let players: Record<number, Player[]> = {};
let chatHistory: Record<string, ChatMessage[]> = {};
let users: User[] = [
  { id: 1, username: "player1", description: "First player", gamesWon: 0, role: "PLAYER" },
];
// --- Extra in-memory state ---
let trades: Record<number, any[]> = {};


// --- Handlers ---
export const handlers = [
  // --- User Management ---
  /*
  http.post("*//*api/chat/**", async ({ request }) => {
  console.log("🔥 CHAT HANDLER HIT", request.url);
  return new Response(null, { status: 201 });
}),*/

  http.get(`${CHAT_API}/matches/:matchId/messages`, ({ params }) => {
    const { matchId } = params;
    const messages = chatHistory[matchId as string] || [];
    return new Response(JSON.stringify({ matchId, messages }), { status: 200 });
  }),


  http.post(`${API_USERS}/login`, async ({ request }) => {
    const body = await request.json() as { username: string };
    const { username } = body;
    const user = users.find(u => u.username === username);
    if (!user) return new Response(JSON.stringify({ error: "INVALID_CREDENTIALS" }), { status: 401 });
    return new Response(JSON.stringify({ token: "mock-jwt-token", user }), { status: 200 });
  }),

  http.post(`${API_USERS}/register`, async ({ request }) => {
  const { username, password, description } = await request.json() as { username: string; password: string; description: string };

  if (users.some(u => u.username === username)) {
    return new Response(JSON.stringify({ error: "USERNAME_ALREADY_EXISTS" }), { status: 400 });
  }

  const now = new Date().toISOString();

  const newUser: User & { createdAt: string; updatedAt: string } = {
    id: users.length + 1,
    username,
    description,
    gamesWon: 0,
    role: "ADMIN",
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);

  return new Response(JSON.stringify(newUser), { status: 201 });
}),


  http.get(`${API_USERS}/:id`, ({ params }) => {
    const id = Number(params.id);
    const user = users.find(u => u.id === id);
    if (!user) return new Response(JSON.stringify({ error: "USER_NOT_FOUND" }), { status: 404 });
    return new Response(JSON.stringify(user), { status: 200 });
  }),

  // --- Game Engine ---
  http.post(`${API_GAME}/matches`, async ({ request }) => {
    const body = await request.json() as { players: number; width: number; height: number; bots: boolean[] };
    const { players: numPlayers, width, height, bots } = body;
    const match: Match = {
      id: matches.length + 1,
      status: "PENDING",
      players: numPlayers,
      width,
      height,
      currentTurn: 1,
      winnerSeat: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    };
    matches.push(match);

    // Initialize board
    const board: Board = {
      width,
      height,
      cells: Array.from({ length: width * height }, (_, idx) => ({
        x: idx % width,
        y: Math.floor(idx / width),
        region: ["SKY","FOREST","WATERS","VILLAGES","MOUNTAINS"][idx % 5] as any,
        ownerSeat: -1,
        hits: 0,
      })),
    };
    boards[match.id] = board;

    // Initialize players
    players[match.id] = Array.from({ length: numPlayers }, (_, idx) => ({
      id: idx + 1,
      seat: idx + 1,
      bot: bots[idx] || false,
      alive: true,
      lightning: 2,
      wood: 2,
      stone: 2,
      glass: 2,
      force: 2,
    }));

    return new Response(JSON.stringify(match), { status: 201 });
  }),

  http.get(`${API_GAME}/board/:matchId`, ({ params }) => {
    const matchId = Number(params.matchId);
    let board = boards[matchId];
    if (!board) {
      // return new Response(JSON.stringify({ error: "BOARD_NOT_FOUND" }), { status: 404 });
    board = {
      width: 5,
      height: 5,
      cells: Array.from({ length: 25 }, (_, idx) => ({
        x: idx % 5,
        y: Math.floor(idx / 5),
        region: "FOREST",
        ownerSeat: -1,
        hits: 0,
      })),
    };
    }
    return new Response(JSON.stringify(board), { status: 200 });
  }),

  http.get(`${API_GAME}/players/:matchId`, ({ params }) => {
    const matchId = Number(params.matchId);
    let matchPlayers = players[matchId];
    if (!matchPlayers) {
      //return new Response(JSON.stringify({ error: "PLAYERS_NOT_FOUND" }), { status: 404 });
      matchPlayers = [
        { id: 1, seat: 1, bot: false, alive: true, lightning: 2, wood: 2, stone: 2, glass: 2, force: 2 },
        { id: 2, seat: 2, bot: true, alive: true, lightning: 2, wood: 2, stone: 2, glass: 2, force: 2 },
      ];
    }
    return new Response(JSON.stringify(matchPlayers), { status: 200 });
  }),

  // --- Chat System ---
  

 http.post(`${CHAT_API}/ai/recommendation`, async ({ request }) => {
  const body = await request.json() as {
    matchId: string | number;
    question: string;
    gameState: any;
  };

  const matchId = String(body.matchId);

  const aiMessage: ChatMessage = {
    id: crypto.randomUUID(),
    senderId: "AI",
    senderName: "AI",
    type: "AI",
    tab: "AI",
    content: `AI Suggestion: Based on your resources, consider expanding.`,
    timestamp: new Date().toISOString(),
  };

  if (!chatHistory[matchId]) {
    chatHistory[matchId] = [];
  }

  // Store AI response in chat history
  chatHistory[matchId].push(aiMessage);

  return new Response(
    JSON.stringify({
      recommendation: aiMessage.content,
      suggestedAction: "BUILD_SETTLEMENT",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}),


  http.get(`${CHAT_API}/health`, () => {
    return new Response(JSON.stringify({ status: "UP" }), { status: 200 });
  }),

  http.post(`${API_GAME}/matches/:matchId/build`, async ({ params, request }) => {
  const matchId = Number(params.matchId);
  const { x, y, seat } = (await request.json()) as {
    x: number;
    y: number;
    seat: number;
  };

  if (!boards[matchId]) {
    boards[matchId] = {
      width: 5,
      height: 5,
      cells: Array.from({ length: 25 }, (_, idx) => ({
        x: idx % 5,
        y: Math.floor(idx / 5),
        region: ["SKY", "FOREST", "WATERS", "VILLAGES", "MOUNTAINS"][idx % 5] as any,
        ownerSeat: -1,
        hits: 0,
      })),
    };
  }

  if (!players[matchId]) {
    players[matchId] = [
      {
        id: 1,
        seat: 1,
        bot: false,
        alive: true,
        lightning: 2,
        wood: 2,
        stone: 2,
        glass: 2,
        force: 2,
      },
      {
        id: 2,
        seat: 2,
        bot: false,
        alive: true,
        lightning: 2,
        wood: 2,
        stone: 2,
        glass: 2,
        force: 2,
      },
    ];
  }

  const board = boards[matchId];
  const matchPlayers = players[matchId];

  const cell = board.cells.find(c => c.x === x && c.y === y);
  if (!cell) {
    return new Response(
      JSON.stringify({ error: "CELL_NOT_FOUND" }),
      { status: 404 }
    );
  }

  // Simple rule: can only build on unowned cell
  if (cell.ownerSeat !== -1) {
    return new Response(
      JSON.stringify({ error: "CELL_ALREADY_OWNED" }),
      { status: 400 }
    );
  }

  const player = matchPlayers.find(p => p.seat === seat);
  if (!player) {
    return new Response(
      JSON.stringify({ error: "PLAYER_NOT_FOUND" }),
      { status: 404 }
    );
  }

  // Cost: 1 wood + 1 stone
  if (player.wood < 1 || player.stone < 1) {
    return new Response(
      JSON.stringify({ error: "NOT_ENOUGH_RESOURCES" }),
      { status: 400 }
    );
  }

  // Apply changes
  player.wood -= 1;
  player.stone -= 1;
  cell.ownerSeat = seat;

  return new Response(
    JSON.stringify({
      board,
      players: matchPlayers,
    }),
    { status: 200 }
  );
  }),

  http.post(`${API_GAME}/matches/:matchId/end-turn`, ({ params }) => {
  const matchId = Number(params.matchId);

  let match = matches.find(m => m.id === matchId);

  // Recover match if lost (Fast Refresh safety)
  if (!match) {
    match = {
      id: matchId,
      status: "PENDING",
      players: 2,
      width: 5,
      height: 5,
      currentTurn: 1,
      winnerSeat: null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
    matches.push(match);
  }

  // Rotate turn

  if (match.status !== "RUNNING") {
    return new Response(JSON.stringify({ error: "MATCH_NOT_RUNNING" }), { status: 400 });
}
  
  const current = match.currentTurn ?? 1;
  match.currentTurn =
    current === match.players ? 1 : current + 1;

  return new Response(
    JSON.stringify({ currentTurn: match.currentTurn }),
    { status: 200 }
  );
}),

http.post(`${CHAT_API}/matches/:matchId/messages`, async ({ params, request }) => {
  const matchId = params.matchId as string;
  const msg = (await request.json()) as ChatMessage;

  if (!chatHistory[matchId]) {
    chatHistory[matchId] = [];
  }

  chatHistory[matchId].push({
    ...msg,
    timestamp: new Date().toISOString(),
  });

  return new Response(null, { status: 201 });
}),

http.get(`${API_GAME}/matches`, () => new Response(JSON.stringify(matches), { status: 200 })),

http.get(`${API_GAME}/matches/:matchId`, ({ params }) => {
  const match = matches.find(m => m.id === Number(params.matchId));
  return new Response(JSON.stringify(match || { error: "MATCH_NOT_FOUND" }), { status: match ? 200 : 404 });
}),

http.patch("/api/users/:id", async ({ params, request }) => {
  const id = Number(params.id);
  const body = await request.json() as {
    username?: string;
    description?: string;
  };

  const user = users.find(u => u.id === id);
  if (!user) {
    return new Response(JSON.stringify({ error: "USER_NOT_FOUND" }), { status: 404 });
  }

  if (body.username !== undefined) user.username = body.username;
  if (body.description !== undefined) user.description = body.description;

  return new Response(JSON.stringify(user), { status: 200 });
}),

http.post("/api/users/:id/wins/increment", ({ params }) => {
  const id = Number(params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return new Response(JSON.stringify({ error: "USER_NOT_FOUND" }), { status: 404 });
  }

  user.gamesWon += 1;

  return new Response(
    JSON.stringify({
      id: user.id,
      username: user.username,
      gamesWon: user.gamesWon,
    }),
    { status: 200 }
  );
}),

http.get("/api/users", ({ request }) => {
  const auth = request.headers.get("Authorization");

  // Mock rule: token containing "ADMIN" means admin
  if (!auth || !auth.includes("ADMIN")) {
    return new Response(JSON.stringify({ error: "FORBIDDEN" }), { status: 403 });
  }

  return new Response(
    JSON.stringify(
      users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
      }))
    ),
    { status: 200 }
  );
}),

http.post("/api/dev/make-admin/:username", ({ params }) => {
  const user = users.find(u => u.username === params.username);
  if (!user) {
    return new Response(JSON.stringify({ error: "USER_NOT_FOUND" }), { status: 404 });
  }

  user.role = "ADMIN";
  return new Response(JSON.stringify(user), { status: 200 });
}),

http.post("/api/actions/:matchId/attack", async ({ params, request }) => {
  const matchId = Number(params.matchId);
  const { playerId, x, y } = await request.json() as {
    playerId: number;
    x: number;
    y: number;
  };

  const board = boards[matchId];
  const matchPlayers = players[matchId];

  if (!board || !matchPlayers) {
    return Response.json({ success: false, message: "MATCH_NOT_FOUND" }, { status: 404 });
  }

  const attacker = matchPlayers.find(p => p.seat === playerId);
  if (!attacker) {
    return Response.json({ success: false, message: "PLAYER_NOT_FOUND" }, { status: 404 });
  }

  if (attacker.lightning <= 0) {
    return Response.json({ success: false, message: "NO_LIGHTNING" });
  }

  const cell = board.cells.find(c => c.x === x && c.y === y);
  if (!cell || cell.ownerSeat === -1) {
    return Response.json({ success: false, message: "NO_HOUSE_HERE" });
  }

  // Apply attack
  attacker.lightning -= 1;
  cell.hits += 1;

  // Destroy house after 3 hits
  if (cell.hits >= 3) {
    const victim = matchPlayers.find(p => p.seat === cell.ownerSeat);
    cell.ownerSeat = -1;
    cell.hits = 0;

    // Check if victim has any houses left
    const stillAlive = board.cells.some(c => c.ownerSeat === victim?.seat);
    if (victim && !stillAlive) {
      victim.alive = false;
    }
  }

  return Response.json({
    success: true,
    message: "ATTACK_SUCCESS",
    traceId: crypto.randomUUID(),
  });
}),

http.post("/api/resources/:matchId/resource-gain", ({ params }) => {
  const matchId = Number(params.matchId);
  const board = boards[matchId];
  const matchPlayers = players[matchId];

  if (!board || !matchPlayers) {
    return Response.json({ success: false, message: "MATCH_NOT_FOUND" }, { status: 404 });
  }

  let housesFound = false;

  board.cells.forEach(cell => {
    if (cell.ownerSeat !== -1) {
      housesFound = true;
      const owner = matchPlayers.find(p => p.seat === cell.ownerSeat);
      if (owner) {
        owner.wood += 1;
        owner.stone += 1;
      }
    }
  });

  return Response.json({
    success: true,
    message: housesFound ? "RESOURCE_GAIN_APPLIED" : "NO_HOUSES",
    traceId: crypto.randomUUID(),
  });
}),

http.post("/api/resources/:matchId/lightning-recharge", ({ params }) => {
  const matchId = Number(params.matchId);
  const matchPlayers = players[matchId];

  if (!matchPlayers) {
    return Response.json({ success: false, message: "MATCH_NOT_FOUND" }, { status: 404 });
  }

  const allZero = matchPlayers
    .filter(p => p.alive)
    .every(p => p.lightning === 0);

  if (allZero) {
    matchPlayers.forEach(p => {
      if (p.alive) p.lightning = 2;
    });

    return Response.json({
      success: true,
      message: "LIGHTNING_RECHARGED",
      traceId: crypto.randomUUID(),
    });
  }

  return Response.json({
    success: true,
    message: "NO_RECHARGE (SOME_HAVE_LIGHTNING)",
    traceId: crypto.randomUUID(),
  });
}),

http.post("/api/trades/:matchId", async ({ params, request }) => {
  const matchId = Number(params.matchId);
  const body = await request.json() as Record<string, any>;

  if (!trades[matchId]) trades[matchId] = [];

  const now = Date.now();
  const trade = {
    id: trades[matchId].length + 1,
    matchId,
    ...body,
    status: "OPEN",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + body.ttlMs).toISOString(),
    acceptedBySeat: null,
    closedAt: null,
  };

  trades[matchId].push(trade);

  return Response.json(trade, { status: 201 });
}),

http.get("/api/trades/:matchId/trades", ({ params, request }) => {
  const matchId = Number(params.matchId);
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const list = (trades[matchId] || []).filter(
    t => !status || t.status === status
  );

  return Response.json(list);
}),

http.post("/api/trades/:matchId/:tradeId/accept", async ({ params, request }) => {
  const matchId = Number(params.matchId);
  const tradeId = Number(params.tradeId);
  const { toSeat } = await request.json() as { toSeat: number };

  const trade = trades[matchId]?.find(t => t.id === tradeId);
  const matchPlayers = players[matchId];

  if (!trade || trade.status !== "OPEN") {
    return Response.json({ error: "OFFER_EXPIRED" }, { status: 409 });
  }

  const from = matchPlayers.find(p => p.seat === trade.from);
  const to = matchPlayers.find(p => p.seat === toSeat);

  if (!from || !to) {
    return Response.json({ error: "PLAYER_NOT_FOUND" }, { status: 404 });
  }

  // Resource check
  const giveKey = trade.give.toLowerCase();
  const getKey = trade.get.toLowerCase();

  if ((to as any)[giveKey] < 1) {
    return Response.json({ error: `ACCEPTER_LACKS_${trade.give}` }, { status: 400 });
  }

  // Exchange
  (to as any)[giveKey] -= 1;
  (from as any)[giveKey] += 1;

  (from as any)[getKey] -= 1;
  (to as any)[getKey] += 1;

  trade.status = "ACCEPTED";
  trade.acceptedBySeat = toSeat;
  trade.closedAt = new Date().toISOString();

  return Response.json({ accepted: true });
})
];
