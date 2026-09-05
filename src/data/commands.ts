import type { IconName } from "../components/ui/Icon";

/**
 * The single source of truth for every Mocha command.
 *
 * Transcribed from the official Mocha command reference (the same list the bot
 * ships with) — nothing here is invented. Where the reference gives a command
 * both a slash form (`/call`) and a prefix form (`mocha call`), both are kept
 * on one entry so the directory never shows the same command twice.
 */

export type CommandSurface = "discord" | "terminal";
export type CommandScope = "everyone" | "server";

export type CommandArg = {
  name: string;
  required: boolean;
  description: string;
};

export type CommandSub = {
  name: string;
  slash: string;
  prefix: string;
  args: CommandArg[];
  description: string;
  example?: string;
};

export type CommandCategory = {
  id: string;
  label: string;
  short: string;
  tagline: string;
  icon: IconName;
  surface: CommandSurface;
};

export type Command = {
  id: string;
  /** Canonical command name, without slash or prefix. */
  name: string;
  category: string;
  description: string;
  /** Slash form, e.g. `/mute <user> <minutes> [reason]`. */
  slash?: string;
  /** Prefix form, e.g. `mocha mute <user> <minutes> [reason]`. */
  prefix?: string;
  /** Extra names the command answers to (`ttt`, `gtf`, …). */
  aliases?: string[];
  args?: CommandArg[];
  example?: string;
  /** `server` = acts on members, channels or server configuration. */
  scope: CommandScope;
  subcommands?: CommandSub[];
  note?: string;
};

export const CATEGORIES: CommandCategory[] = [
  {
    id: "general",
    label: "General & core",
    short: "Core",
    tagline: "calls, prefixes, and the plumbing",
    icon: "signal",
    surface: "discord",
  },
  {
    id: "games",
    label: "Games",
    short: "Games",
    tagline: "start something in chat, keep the score",
    icon: "gamepad",
    surface: "discord",
  },
  {
    id: "music",
    label: "Music & voice",
    short: "Music",
    tagline: "queue it up without leaving the channel",
    icon: "music",
    surface: "discord",
  },
  {
    id: "utility",
    label: "Utility",
    short: "Utility",
    tagline: "profiles and avatars, no clicking required",
    icon: "user",
    surface: "discord",
  },
  {
    id: "moderation",
    label: "Moderation",
    short: "Moderation",
    tagline: "keep the place tidy",
    icon: "shield",
    surface: "discord",
  },
  {
    id: "giveaways",
    label: "Giveaways",
    short: "Giveaways",
    tagline: "hype with a deadline",
    icon: "gift",
    surface: "discord",
  },
  {
    id: "quotes",
    label: "Quotes",
    short: "Quotes",
    tagline: "keep the good lines",
    icon: "quote",
    surface: "discord",
  },
  {
    id: "valorant",
    label: "Valorant",
    short: "Valorant",
    tagline: "name#tag in, account info out",
    icon: "target",
    surface: "discord",
  },
  {
    id: "terminal",
    label: "Terminal",
    short: "Terminal",
    tagline: "music driven from the console, not from Discord",
    icon: "terminal",
    surface: "terminal",
  },
];

const NO_REASON = 'Optional reason. Defaults to "No reason provided".';

export const COMMANDS: Command[] = [
  /* ---------------------------------------------------------- general -- */
  {
    id: "speak",
    name: "speak",
    category: "general",
    description: "Make the bot say something.",
    slash: "/speak <message>",
    args: [{ name: "message", required: true, description: "Text for the bot to say." }],
    example: "/speak meeting in voice in five",
    scope: "everyone",
  },
  {
    id: "call",
    name: "call",
    category: "general",
    description: "Connect this channel to another server for a call.",
    slash: "/call [server_id]",
    prefix: "mocha call [server_id]",
    args: [
      {
        name: "server_id",
        required: false,
        description: "Optional server ID to call directly. If omitted, joins the matchmaking queue.",
      },
    ],
    example: "mocha call",
    scope: "everyone",
    note: "Without a server id, Mocha puts the channel in the matchmaking queue and pairs it with another server.",
  },
  {
    id: "hangup",
    name: "hangup",
    category: "general",
    description: "End the current call, or leave the matchmaking queue.",
    slash: "/hangup",
    prefix: "mocha hangup",
    scope: "everyone",
  },
  {
    id: "call-config",
    name: "call-config",
    category: "general",
    description: "Configure the channel used for calls.",
    slash: "/call-config <channel>",
    args: [{ name: "channel", required: true, description: "Channel to use for calls." }],
    example: "/call-config #calls",
    scope: "server",
  },
  {
    id: "set-prefix",
    name: "set-prefix",
    category: "general",
    description: "Set or clear the server's custom command prefix.",
    slash: "/set-prefix [prefix]",
    args: [
      {
        name: "prefix",
        required: false,
        description: "Custom server command prefix. Leave empty to clear it.",
      },
    ],
    example: "/set-prefix !m",
    scope: "server",
    note: "The prefix only changes the text form of commands — slash commands keep working the same way.",
  },
  {
    id: "sync",
    name: "sync",
    category: "general",
    description: "Sync the command tree for the current server.",
    prefix: "mocha sync",
    aliases: ["sync"],
    scope: "server",
    note: "Use it when a slash command has not shown up in the picker yet.",
  },

  /* ------------------------------------------------------------ games -- */
  {
    id: "tictactoe",
    name: "tictactoes",
    category: "games",
    description: "Play Tic Tac Toe.",
    slash: "/tictactoes [opponent]",
    prefix: "mocha ttt [opponent]",
    aliases: ["ttt", "tic tac toe"],
    args: [{ name: "opponent", required: false, description: "Optional opponent." }],
    example: "mocha ttt @rival",
    scope: "everyone",
  },
  {
    id: "geoguessr",
    name: "geoguessr",
    category: "games",
    description: "Start a GeoGuessr game.",
    slash: "/geoguessr",
    prefix: "mocha geoguessr",
    scope: "everyone",
  },
  {
    id: "fasttype",
    name: "fasttype",
    category: "games",
    description: "Start a FastType game.",
    slash: "/fasttype",
    prefix: "mocha fasttype",
    aliases: ["fast type", "typing"],
    scope: "everyone",
  },
  {
    id: "guesstheflag",
    name: "guesstheflag",
    category: "games",
    description: "Start a Guess The Flag game.",
    slash: "/guesstheflag",
    prefix: "mocha gtf",
    aliases: ["gtf", "flags"],
    scope: "everyone",
  },
  {
    id: "stop-game",
    name: "stop",
    category: "games",
    description: "Stop a running game.",
    slash: "/stop",
    prefix: "mocha stop",
    scope: "everyone",
  },
  {
    id: "stats",
    name: "stats",
    category: "games",
    description: "View a member's game statistics.",
    slash: "/stats [member]",
    args: [
      {
        name: "member",
        required: false,
        description: "Optional member whose statistics you want to view.",
      },
    ],
    example: "/stats @rival",
    scope: "everyone",
  },
  {
    id: "leaderboard",
    name: "leaderboard",
    category: "games",
    description: "Show the global leaderboard.",
    slash: "/leaderboard",
    aliases: ["top", "ranking"],
    scope: "everyone",
  },

  /* ------------------------------------------------------------ music -- */
  {
    id: "join",
    name: "join",
    category: "music",
    description: "Join your voice channel.",
    slash: "/join",
    scope: "everyone",
  },
  {
    id: "play",
    name: "play",
    category: "music",
    description: "Play a song or add it to the queue.",
    slash: "/play <song_query>",
    args: [
      {
        name: "song_query",
        required: true,
        description: "Song name, YouTube URL, or Spotify URL.",
      },
    ],
    example: "/play lofi beats",
    scope: "everyone",
  },
  {
    id: "pause",
    name: "pause",
    category: "music",
    description: "Pause the current song.",
    slash: "/pause",
    scope: "everyone",
  },
  {
    id: "resume",
    name: "resume",
    category: "music",
    description: "Resume the paused song.",
    slash: "/resume",
    scope: "everyone",
  },
  {
    id: "skip",
    name: "skip",
    category: "music",
    description: "Skip the current song.",
    slash: "/skip",
    scope: "everyone",
  },
  {
    id: "seek",
    name: "seek",
    category: "music",
    description: "Jump to a specific point in the current song.",
    slash: "/seek <timestamp>",
    args: [
      {
        name: "timestamp",
        required: true,
        description: "Where to jump to, e.g. 1:23 or 90.",
      },
    ],
    example: "/seek 1:23",
    scope: "everyone",
  },
  {
    id: "remove",
    name: "remove",
    category: "music",
    description: "Remove a song from the queue.",
    slash: "/remove <position>",
    args: [
      {
        name: "position",
        required: true,
        description: "Position in the queue to remove; see /queue for numbers.",
      },
    ],
    example: "/remove 3",
    scope: "everyone",
  },
  {
    id: "loop",
    name: "loop",
    category: "music",
    description: "Loop the current song. Omit times to loop until skipped.",
    slash: "/loop [times]",
    args: [
      {
        name: "times",
        required: false,
        description: "How many times total to play the song. Omit to loop forever, 0 to turn off.",
      },
    ],
    example: "/loop 3",
    scope: "everyone",
  },
  {
    id: "stop-music",
    name: "stop",
    category: "music",
    description: "Stop music and clear the queue.",
    slash: "/stop",
    scope: "everyone",
  },
  {
    id: "leave",
    name: "leave",
    category: "music",
    description: "Leave the voice channel.",
    slash: "/leave",
    scope: "everyone",
  },
  {
    id: "queue",
    name: "queue",
    category: "music",
    description: "Show the current music queue.",
    slash: "/queue",
    scope: "everyone",
  },
  {
    id: "nowplaying",
    name: "nowplaying",
    category: "music",
    description: "Show the current song.",
    slash: "/nowplaying",
    aliases: ["np", "current song"],
    scope: "everyone",
  },

  /* ---------------------------------------------------------- utility -- */
  {
    id: "avatar",
    name: "avatar",
    category: "utility",
    description: "Shows a user's Discord avatar.",
    slash: "/avatar [user]",
    args: [{ name: "user", required: false, description: "Optional user whose avatar to show." }],
    example: "/avatar @friend",
    scope: "everyone",
  },
  {
    id: "userinfo",
    name: "userinfo",
    category: "utility",
    description: "Shows information about a user.",
    slash: "/userinfo [user]",
    prefix: "mocha userinfo [user]",
    args: [{ name: "user", required: false, description: "Optional user whose information to show." }],
    example: "/userinfo",
    scope: "everyone",
  },

  /* ------------------------------------------------------- moderation -- */
  {
    id: "ban",
    name: "ban",
    category: "moderation",
    description: "Ban a member from the server.",
    slash: "/ban <user> [reason]",
    prefix: "mocha ban <user> [reason]",
    args: [
      { name: "user", required: true, description: "Member to ban." },
      { name: "reason", required: false, description: NO_REASON },
    ],
    example: "/ban @spammer Advertising in DMs",
    scope: "server",
  },
  {
    id: "kick",
    name: "kick",
    category: "moderation",
    description: "Kick a member from the server.",
    slash: "/kick <user> [reason]",
    prefix: "mocha kick <user> [reason]",
    args: [
      { name: "user", required: true, description: "Member to kick." },
      { name: "reason", required: false, description: NO_REASON },
    ],
    example: "/kick @user Wrong server",
    scope: "server",
  },
  {
    id: "mute",
    name: "mute",
    category: "moderation",
    description: "Timeout a member.",
    slash: "/mute <user> <minutes> [reason]",
    prefix: "mocha mute <user> <minutes> [reason]",
    aliases: ["timeout"],
    args: [
      { name: "user", required: true, description: "Member to timeout." },
      { name: "minutes", required: true, description: "Timeout duration in minutes. Must be at least 1." },
      { name: "reason", required: false, description: NO_REASON },
    ],
    example: "/mute @user 10 Earrape in voice",
    scope: "server",
  },
  {
    id: "unmute",
    name: "unmute",
    category: "moderation",
    description: "Remove a member's timeout.",
    slash: "/unmute <user>",
    prefix: "mocha unmute <user>",
    args: [{ name: "user", required: true, description: "Member whose timeout should be removed." }],
    example: "/unmute @user",
    scope: "server",
  },
  {
    id: "lock",
    name: "lock",
    category: "moderation",
    description: "Lock a channel.",
    slash: "/lock [channel]",
    prefix: "mocha lock [channel]",
    args: [
      {
        name: "channel",
        required: false,
        description: "Optional text channel. Defaults to the current channel.",
      },
    ],
    example: "/lock #general",
    scope: "server",
  },
  {
    id: "unlock",
    name: "unlock",
    category: "moderation",
    description: "Unlock a channel.",
    slash: "/unlock [channel]",
    prefix: "mocha unlock [channel]",
    args: [
      {
        name: "channel",
        required: false,
        description: "Optional text channel. Defaults to the current channel.",
      },
    ],
    example: "/unlock #general",
    scope: "server",
  },
  {
    id: "audit",
    name: "audit",
    category: "moderation",
    description: "Show recent server audit-log entries.",
    slash: "/audit [limit]",
    prefix: "mocha audit [limit]",
    args: [
      {
        name: "limit",
        required: false,
        description: "Optional number of audit-log entries to show. Defaults to 10, maximum 100.",
      },
    ],
    example: "/audit 25",
    scope: "server",
  },
  {
    id: "role",
    name: "role",
    category: "moderation",
    description: "Manage server roles.",
    slash: "/role",
    prefix: "mocha role",
    scope: "server",
    note: "A command group: run it with one of the subcommands below.",
    subcommands: [
      {
        name: "add",
        slash: "/role add <user> <role>",
        prefix: "mocha role add <user> <role>",
        args: [
          { name: "user", required: true, description: "Member receiving the role." },
          { name: "role", required: true, description: "Role to add." },
        ],
        description: "Add a role to a member.",
        example: "/role add @user Moderator",
      },
      {
        name: "remove",
        slash: "/role remove <user> <role>",
        prefix: "mocha role remove <user> <role>",
        args: [
          { name: "user", required: true, description: "Member losing the role." },
          { name: "role", required: true, description: "Role to remove." },
        ],
        description: "Remove a role from a member.",
        example: "/role remove @user Moderator",
      },
      {
        name: "create",
        slash: "/role create <name> [colour]",
        prefix: "mocha role create <name> [colour]",
        args: [
          { name: "name", required: true, description: "Name of the new role." },
          {
            name: "colour",
            required: false,
            description: 'Optional role colour. Defaults to "default". Examples: #ff0000, red, blue.',
          },
        ],
        description: "Create a new role.",
        example: "/role create Regulars #ff0000",
      },
      {
        name: "delete",
        slash: "/role delete <role>",
        prefix: "mocha role delete <role>",
        args: [{ name: "role", required: true, description: "Role to delete." }],
        description: "Delete a server role.",
        example: "/role delete Old Role",
      },
    ],
  },

  /* -------------------------------------------------------- giveaways -- */
  {
    id: "giveaway",
    name: "giveaway",
    category: "giveaways",
    description: "Start a giveaway.",
    slash: "/giveaway <duration> <channel> <winners> <prize> [include] [exclude]",
    args: [
      { name: "duration", required: true, description: "How long the giveaway runs, in seconds. Maximum 30 days." },
      { name: "channel", required: true, description: "Channel where the giveaway will be posted." },
      { name: "winners", required: true, description: "Number of winners." },
      { name: "prize", required: true, description: "What is being given away." },
      {
        name: "include",
        required: false,
        description: "Optional users/roles allowed to enter. Mentions or IDs, space-separated.",
      },
      {
        name: "exclude",
        required: false,
        description: "Optional users/roles not allowed to enter. Mentions or IDs, space-separated.",
      },
    ],
    example: "/giveaway 3600 #giveaways 1 Nitro",
    scope: "server",
  },

  /* ------------------------------------------------------------ quotes -- */
  {
    id: "quote",
    name: "quote",
    category: "quotes",
    description: "Create a quote card from the message being replied to.",
    prefix: "mocha quote",
    scope: "everyone",
    note: "Reply to the message you want to keep, then run the command.",
  },
  {
    id: "quotes-channel",
    name: "quotes channel",
    category: "quotes",
    description: "Mirror every quote card to a channel. Originals still post where they are made.",
    slash: "/quotes channel [channel]",
    args: [
      {
        name: "channel",
        required: false,
        description: "Channel where quote cards should be mirrored. Leave empty to turn mirroring off.",
      },
    ],
    example: "/quotes channel #quote-archive",
    scope: "server",
  },

  /* ---------------------------------------------------------- valorant -- */
  {
    id: "valinfo",
    name: "valinfo",
    category: "valorant",
    description: "Get Valorant account information using Name#Tag.",
    slash: "/valinfo <riot_id>",
    args: [{ name: "riot_id", required: true, description: "Valorant name and tag, e.g. Shroud#NA1." }],
    example: "/valinfo Shroud#NA1",
    scope: "everyone",
  },

  /* ---------------------------------------------------------- terminal -- */
  {
    id: "term-help",
    name: "help",
    category: "terminal",
    description: "Show terminal help.",
    prefix: "help",
    scope: "everyone",
  },
  {
    id: "term-join",
    name: "join",
    category: "terminal",
    description: "Join a server's voice channel.",
    prefix: "join <server_id> <channel_id>",
    args: [
      { name: "server_id", required: true, description: "Discord server ID." },
      { name: "channel_id", required: true, description: "Voice channel ID." },
    ],
    scope: "everyone",
  },
  {
    id: "term-play",
    name: "play",
    category: "terminal",
    description: "Play a song.",
    prefix: "play <server_id> <song>",
    args: [
      { name: "server_id", required: true, description: "Discord server ID." },
      { name: "song", required: true, description: "Song to play." },
    ],
    scope: "everyone",
  },
  {
    id: "term-pause",
    name: "pause",
    category: "terminal",
    description: "Pause music.",
    prefix: "pause <server_id>",
    args: [{ name: "server_id", required: true, description: "Discord server ID." }],
    scope: "everyone",
  },
  {
    id: "term-resume",
    name: "resume",
    category: "terminal",
    description: "Resume music.",
    prefix: "resume <server_id>",
    args: [{ name: "server_id", required: true, description: "Discord server ID." }],
    scope: "everyone",
  },
  {
    id: "term-skip",
    name: "skip",
    category: "terminal",
    description: "Skip the current song.",
    prefix: "skip <server_id>",
    args: [{ name: "server_id", required: true, description: "Discord server ID." }],
    scope: "everyone",
  },
  {
    id: "term-seek",
    name: "seek",
    category: "terminal",
    description: "Seek within the current song.",
    prefix: "seek <server_id> <timestamp>",
    args: [
      { name: "server_id", required: true, description: "Discord server ID." },
      { name: "timestamp", required: true, description: "Position to seek to." },
    ],
    scope: "everyone",
  },
  {
    id: "term-queue",
    name: "queue",
    category: "terminal",
    description: "Show the queue.",
    prefix: "queue <server_id>",
    args: [{ name: "server_id", required: true, description: "Discord server ID." }],
    scope: "everyone",
  },
  {
    id: "term-stop",
    name: "stop",
    category: "terminal",
    description: "Stop music.",
    prefix: "stop <server_id>",
    args: [{ name: "server_id", required: true, description: "Discord server ID." }],
    scope: "everyone",
  },
  {
    id: "term-leave",
    name: "leave",
    category: "terminal",
    description: "Leave the voice channel.",
    prefix: "leave <server_id>",
    args: [{ name: "server_id", required: true, description: "Discord server ID." }],
    scope: "everyone",
  },
  {
    id: "term-exit",
    name: "exit",
    category: "terminal",
    description: "Exit the terminal command loop.",
    prefix: "exit",
    scope: "everyone",
  },
];

/* ------------------------------------------------------------ helpers -- */

export const CATEGORY_BY_ID: Record<string, CommandCategory> = CATEGORIES.reduce(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<string, CommandCategory>
);

export const DISCORD_COMMANDS = COMMANDS.filter((command) => CATEGORY_BY_ID[command.category].surface === "discord");
export const TERMINAL_COMMANDS = COMMANDS.filter((command) => CATEGORY_BY_ID[command.category].surface === "terminal");

export const DISCORD_CATEGORIES = CATEGORIES.filter((category) => category.surface === "discord");

/** Every name a command answers to, used for search matching. */
export function commandNames(command: Command): string[] {
  const names = [command.name, ...(command.aliases ?? [])];
  (command.subcommands ?? []).forEach((sub) => names.push(`${command.name} ${sub.name}`, sub.name));
  return names.filter(Boolean);
}

/** Primary signature shown on a collapsed row: slash first, prefix as fallback. */
export function primarySignature(command: Command): string {
  return command.slash ?? command.prefix ?? command.name;
}

/** Plain-text signature used for the copy button. */
export function copySignature(command: Command): string {
  return primarySignature(command);
}

export function commandSearchText(command: Command): string {
  const category = CATEGORY_BY_ID[command.category];
  const parts = [
    ...commandNames(command),
    command.description,
    command.note ?? "",
    category?.label ?? "",
    category?.short ?? "",
    command.example ?? "",
    ...(command.args ?? []).map((arg) => `${arg.name} ${arg.description}`),
    ...(command.subcommands ?? []).map((sub) => `${sub.name} ${sub.description} ${sub.slash}`),
  ];
  return parts.join(" ").toLowerCase();
}

export function commandsByCategory(categoryId: string): Command[] {
  return COMMANDS.filter((command) => command.category === categoryId);
}

export function findCommand(id: string): Command | undefined {
  return COMMANDS.find((command) => command.id === id);
}
