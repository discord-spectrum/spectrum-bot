require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Partials
} = require('discord.js');

// ====================
// 역할 ID 설정
// ====================

const ROLE_IDS = {
    security: '1556134144428212364',
    guide: '1556134324393213952',
    viceOwner: '1556136077729988768',
    representative: '1556133097958015016',
    admin: '1556133196259655821',
    adminAdditional: '1556520304262651934',
    owner: '1556133134188413089',
    member: '1556134858563264603'
};

// ====================
// 게임 역할 ID 설정
// ====================

const GAME_ROLE_IDS = {
    battlegrounds: '1556135266370981930',
    roblox: '1556135484437299200',
    valorant: '1556135330619461663',
    league: '1556135362324074616',
    steam: '1556135416682389585',
    other: '1556135451788714055',
    minecraft: '1556135303176257708'
};

// ====================
// 입장 로그 채널
// ====================

const JOIN_LOG_CHANNEL_ID =
    '1556141798060195870';

// ====================
// 서버 입장 환영 채널
// ====================

const WELCOME_CHANNEL_ID =
    '1556143653670355014';

// ====================
// 퇴장 로그 채널
// ====================

const LEAVE_LOG_CHANNEL_ID =
    '1556141818427613301';

// ====================
// 경고 차감 로그 채널
// ====================

const WARNING_LOG_CHANNEL_ID =
    '1556148017873166356';

// ====================
// 경고 지급 로그 채널
// ====================

const WARNING_ISSUE_LOG_CHANNEL_ID =
    '1556147970297045043';

// ====================
// 추방 로그 채널
// ====================

const KICK_LOG_CHANNEL_ID =
    '1556147970297045043';

// ====================
// 티켓 로그 채널
// ====================

const TICKET_LOG_CHANNEL_ID =
    '1556147255327723623';

// ====================
// 청소 로그 채널
// ====================

const CLEAN_LOG_CHANNEL_ID =
    '1556573455002898452';

// ====================
// 관리자 멘션 설정
// ====================

const ADMIN_MENTION_ROLE_ID =
    '1556134768565952614';

const ADMIN_MENTION_CHANNEL_ID =
    '1556143436032245770';

// ====================
// 영구차단 로그 채널
// ====================

const PERMANENT_BAN_LOG_CHANNEL_ID =
    '1556147237749391412';

// ====================
// 영구차단 해제 로그 채널
// ====================

const PERMANENT_UNBAN_LOG_CHANNEL_ID =
    '1556590681017946182';

// ====================
// 신고 카테고리
// ====================

const TICKET_CATEGORY_ID =
    '1556132511694987294';

// ====================
// 권한 확인 함수
// ====================

function hasRole(member, roleIds) {
    return roleIds.some(
        roleId => member.roles.cache.has(roleId)
    );
}

function canClean(member) {
    return hasRole(member, [
        ROLE_IDS.representative,
        ROLE_IDS.admin,
        ROLE_IDS.adminAdditional,
        ROLE_IDS.owner
    ]);
}

function canWarning(member) {
    return hasRole(member, [
        ROLE_IDS.security,
        ROLE_IDS.admin,
        ROLE_IDS.adminAdditional,
        ROLE_IDS.owner
    ]);
}

function canPunish(member) {
    return hasRole(member, [
        ROLE_IDS.owner
    ]);
}

function canViewServerInfo(member) {
    return hasRole(member, [
        ROLE_IDS.viceOwner,
        ROLE_IDS.representative,
        ROLE_IDS.admin,
        ROLE_IDS.adminAdditional,
        ROLE_IDS.owner
    ]);
}

function canViewUserInfo(member) {
    return hasRole(member, [
        ROLE_IDS.guide,
        ROLE_IDS.viceOwner,
        ROLE_IDS.representative,
        ROLE_IDS.admin,
        ROLE_IDS.adminAdditional,
        ROLE_IDS.owner
    ]);
}

function canCloseTicket(member) {
    return hasRole(member, [
        ROLE_IDS.security,
        ROLE_IDS.viceOwner,
        ROLE_IDS.representative,
        ROLE_IDS.admin,
        ROLE_IDS.adminAdditional,
        ROLE_IDS.owner
    ]);
}

function canCreateTicketPanel(member) {
    return hasRole(member, [
        ROLE_IDS.owner
    ]);
}

function canOpenTicket(member) {
    return hasRole(member, [
        ROLE_IDS.member
    ]);
}

// ====================
// 경고 데이터 저장
// ====================

const warningsFile =
    path.join(__dirname, 'warnings.json');

let warnings = new Map();

if (fs.existsSync(warningsFile)) {
    try {
        const data =
            JSON.parse(
                fs.readFileSync(
                    warningsFile,
                    'utf8'
                )
            );

        warnings =
            new Map(
                Object.entries(data)
            );

        console.log(
            '경고 데이터를 불러왔습니다.'
        );

    } catch (error) {
        console.error(
            '경고 데이터를 불러오는 중 오류가 발생했습니다:',
            error
        );
    }
}

function saveWarnings() {
    const data =
        Object.fromEntries(
            warnings
        );

    fs.writeFileSync(
        warningsFile,
        JSON.stringify(
            data,
            null,
            2
        ),
        'utf8'
    );
}

// ====================
// 반응 역할 패널 데이터
// ====================

const reactionRolePanelsFile =
    path.join(
        __dirname,
        'reactionRolePanels.json'
    );

const reactionRolePanels =
    new Map();

if (fs.existsSync(reactionRolePanelsFile)) {
    try {
        const data =
            JSON.parse(
                fs.readFileSync(
                    reactionRolePanelsFile,
                    'utf8'
                )
            );

        for (
            const [messageId, panel] of
            Object.entries(data)
        ) {
            if (
                typeof panel.guildId === 'string' &&
                panel.roleByEmoji &&
                typeof panel.roleByEmoji === 'object'
            ) {
                reactionRolePanels.set(
                    messageId,
                    panel
                );
            }
        }

        console.log(
            '반응 역할 패널 데이터를 불러왔습니다.'
        );

    } catch (error) {
        console.error(
            '반응 역할 패널 데이터를 불러오는 중 오류가 발생했습니다:',
            error
        );
    }
}

function saveReactionRolePanels() {
    fs.writeFileSync(
        reactionRolePanelsFile,
        JSON.stringify(
            Object.fromEntries(
                reactionRolePanels
            ),
            null,
            2
        ),
        'utf8'
    );
}

// ====================
// 관리 로그 보내기
// ====================

async function sendLog(
    guild,
    channelId,
    title,
    description
) {
    const channel =
        guild.channels.cache.get(
            channelId
        );

    if (!channel) {
        console.error(
            `[관리 로그 오류] 채널을 찾을 수 없습니다: ${channelId}`
        );
        return;
    }

    const embed =
        new EmbedBuilder()
            .setTitle(
                `🛡️ ${title}`
            )
            .setDescription(
                description
            )
            .setTimestamp()
            .setFooter({
                text:
                    '잔상봇 관리 로그'
            });

    await channel.send({
        embeds: [embed]
    }).catch(() => {});
}

// ====================
// 초대 링크 캐시
// ====================

const inviteCache = new Map();

async function cacheGuildInvites(guild) {
    try {
        const invites =
            await guild.invites.fetch();

        const inviteData =
            new Map(
                invites.map(
                    invite => [
                        invite.code,
                        {
                            uses:
                                invite.uses ?? 0,
                            inviterId:
                                invite.inviter?.id ?? null
                        }
                    ]
                )
            );

        inviteCache.set(
            guild.id,
            inviteData
        );

        console.log(
            `[초대 캐시] ${guild.name} 초대 링크 ${inviteData.size}개 저장`
        );

    } catch (error) {
        console.error(
            `[초대 캐시 오류] ${guild.name}:`,
            error
        );
    }
}

// ====================
// 봇 설정
// ====================

const client =
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent
        ],
        partials: [
            Partials.Channel,
            Partials.Message,
            Partials.Reaction,
            Partials.User
        ]
    });

// ====================
// 로그인 완료
// ====================

client.once(
    'clientReady',
    async () => {

        console.log(
            `잔상봇 로그인 완료! ${client.user.tag}`
        );

        for (
            const guild of client.guilds.cache.values()
        ) {
            await cacheGuildInvites(
                guild
            );
        }
    }
);

// ====================
// 멤버 입장
// ====================

client.on(
    'guildMemberAdd',
    async member => {

        console.log(
            `[입장 감지] ${member.user.tag} (${member.id})`
        );

        // ====================
        // 1. 입장 로그
        // ====================

        try {

            const channel =
                member.guild.channels.cache.get(
                    JOIN_LOG_CHANNEL_ID
                );

            if (!channel) {

                console.error(
                    `[입장 로그 오류] 채널을 찾을 수 없습니다: ${JOIN_LOG_CHANNEL_ID}`
                );

            } else {

                let inviterText =
                    '확인할 수 없음';

                let inviteCodeText =
                    '확인할 수 없음';

                try {

                    const oldInvites =
                        inviteCache.get(
                            member.guild.id
                        ) || new Map();

                    const newInvites =
                        await member.guild.invites.fetch();

                    const usedInvite =
                        newInvites.find(
                            invite => {

                                const oldInvite =
                                    oldInvites.get(
                                        invite.code
                                    );

                                if (!oldInvite) {
                                    return false;
                                }

                                return (
                                    (invite.uses ?? 0) >
                                    oldInvite.uses
                                );
                            }
                        );

                    if (usedInvite) {

                        if (usedInvite.inviter) {

                            inviterText =
                                `${usedInvite.inviter} (${usedInvite.inviter.tag})`;

                        }

                        inviteCodeText =
                            `\`${usedInvite.code}\``;
                    }

                    const updatedInviteData =
                        new Map(
                            newInvites.map(
                                invite => [
                                    invite.code,
                                    {
                                        uses:
                                            invite.uses ?? 0,
                                        inviterId:
                                            invite.inviter?.id ?? null
                                    }
                                ]
                            )
                        );

                    inviteCache.set(
                        member.guild.id,
                        updatedInviteData
                    );

                } catch (inviteError) {

                    console.error(
                        '초대자 확인 중 오류:',
                        inviteError
                    );
                }

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            '🟢 새로운 멤버 입장'
                        )
                        .setDescription(
                            `👤 **입장한 멤버**\n` +
                            `${member}\n\n` +

                            `🪪 **사용자명**\n` +
                            `${member.user.tag}\n\n` +

                            `🆔 **사용자 ID**\n` +
                            `\`${member.id}\`\n\n` +

                            `📨 **초대한 사람**\n` +
                            `${inviterText}\n\n` +

                            `🔗 **초대 코드**\n` +
                            `${inviteCodeText}`
                        )
                        .setThumbnail(
                            member.user.displayAvatarURL({
                                dynamic: true
                            })
                        )
                        .setTimestamp()
                        .setFooter({
                            text:
                                '잔상봇 입장 로그'
                        });

                await channel.send({
                    embeds: [embed]
                });

                console.log(
                    `[입장 로그 완료] ${member.user.tag}`
                );
            }

        } catch (error) {

            console.error(
                '입장 로그 처리 중 오류:',
                error
            );
        }

        // ====================
        // 2. 서버 입장 환영 메시지
        // ====================

        try {

            const welcomeChannel =
                member.guild.channels.cache.get(
                    WELCOME_CHANNEL_ID
                );

            if (!welcomeChannel) {

                console.error(
                    `[환영 메시지 오류] 환영 채널을 찾을 수 없습니다: ${WELCOME_CHANNEL_ID}`
                );

                return;
            }

            const welcomeMessage =
                `${member}\n\n` +
                `# 🌙 「잔상」에 오신 것을 환영합니다.\n\n` +

                `누군가에게는 스쳐 지나가는 만남일지 모르지만,\n` +
                `이곳에서의 순간이 오래 기억되는 **잔상**이 되길 바랍니다.\n\n` +

                `처음의 만남이 작은 흔적이 되어,\n` +
                `오래 기억되는 순간으로 남길 바랍니다.\n\n` +

                `╭・┈・┈・┈・✦・┈・┈・┈・╮\n\n` +

                `### 📝 01. 자기소개\n\n` +
                `<#1556143674809778248> 채널에서 간단하게 자기소개를 남겨주세요.\n\n` +

                `### 🪪 02. 경로 인증\n\n` +
                `<#1556143703180181605> 채널에서 잔상을 알게 된 경로를 남겨주세요.\n\n` +

                `### 👍 03. 추천 인증\n\n` +
                `<#1556324050773610496> 채널에서 추천 인증을 진행해 주세요.\n\n` +

                `### 🛡️ 04. 안내팀 호출\n\n` +
                `<#1556143722968649798> 채널에서 안내팀을 멘션해 주시면\n` +
                `서버 이용에 필요한 안내를 도와드립니다.\n\n` +

                `╰・┈・┈・┈・✦・┈・┈・┈・╯`;

            await welcomeChannel.send({
                content:
                    welcomeMessage,

                allowedMentions: {
                    users: [
                        member.id
                    ]
                }
            });

            console.log(
                `[환영 메시지 완료] ${member.user.tag} → #${welcomeChannel.name}`
            );

        } catch (error) {

            console.error(
                '[환영 메시지 전송 오류]',
                error
            );
        }
    }
);

// ====================
// 멤버 퇴장 로그
// ====================

client.on(
    'guildMemberRemove',
    async member => {

        try {

            const channel =
                member.guild.channels.cache.get(
                    LEAVE_LOG_CHANNEL_ID
                );

            if (!channel) {

                console.error(
                    '퇴장 로그 채널을 찾을 수 없습니다.'
                );

                return;
            }

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        '🔴 멤버 퇴장'
                    )
                    .setDescription(
                        `👤 **퇴장한 멤버**\n` +
                        `${member.user}\n\n` +

                        `🪪 **사용자명**\n` +
                        `${member.user.tag}\n\n` +

                        `🆔 **사용자 ID**\n` +
                        `\`${member.id}\`\n\n` +

                        `👥 **남은 서버 인원**\n` +
                        `${member.guild.memberCount}명`
                    )
                    .setThumbnail(
                        member.user.displayAvatarURL({
                            dynamic: true
                        })
                    )
                    .setTimestamp()
                    .setFooter({
                        text:
                            '잔상봇 퇴장 로그'
                    });

            await channel.send({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                '퇴장 로그 처리 중 오류:',
                error
            );
        }
    }
);

// ====================
// 메시지 명령어
// ====================

client.on(
    'messageCreate',
    async message => {

        if (message.author.bot) return;
        if (!message.guild) return;

        // ====================
        // 도움말
        // ====================

        if (message.content === '.도움말') {

            await message.reply(
                '**잔상봇 명령어**\n\n' +
                '📖 `.도움말` — 사용 가능한 명령어 확인\n' +
                '🧹 `.청소 숫자` — 메시지 삭제\n' +
                '⚠️ `.경고 @멤버 [횟수] 사유` — 경고 지급\n' +
                '📋 `.경고확인 @멤버` — 경고 횟수 확인\n' +
                '➖ `.경고차감 @멤버 [횟수]` — 경고 차감\n' +
                '👢 `.추방 @멤버 사유` — 멤버 추방\n' +
                '🔨 `.밴 @멤버 사유` — 멤버 차단\n' +
                '🔓 `.밴해제 사용자ID 사유` — 밴 해제\n' +
                '🏠 `.서버정보` — 서버 정보 확인\n' +
                '👤 `.유저정보 @멤버` — 멤버 정보 확인\n' +
                '🎮 `.게임역할` — 게임 역할 선택판 생성\n' +
                '🎭 `.역할판 😀 @역할1 🎮 @역할2` — 반응 역할판 생성 (소유주 전용)\n' +
                '🎫 `.티켓` — 티켓 안내판 생성 (소유주 전용)\n' +
                '🔒 `.티켓닫기` — 신고 채널 닫기\n' +
                '📢 `.관리자멘션` — 관리자 전체 멘션 (소유주 전용)'
            );

            return;
        }

        // ====================
        // 관리자 전체 멘션
        // ====================

        if (
            message.content === '.관리자멘션'
        ) {

            if (!canPunish(message.member)) {

                return message.reply(
                    '❌ 이 명령어는 서버 소유주만 사용할 수 있습니다.'
                );
            }

            const adminMentionChannel =
                message.guild.channels.cache.get(
                    ADMIN_MENTION_CHANNEL_ID
                );

            if (!adminMentionChannel) {

                return message.reply(
                    '❌ 관리자 멘션 채널을 찾을 수 없습니다.'
                );
            }

            try {

                await adminMentionChannel.send({
                    content:
                        `<@&${ADMIN_MENTION_ROLE_ID}>`,

                    allowedMentions: {
                        roles: [
                            ADMIN_MENTION_ROLE_ID
                        ]
                    }
                });

                await message.reply(
                    `📢 **관리자 전체 멘션을 전송했습니다.**\n\n` +
                    `📌 전송 채널: ${adminMentionChannel}`
                );

            } catch (error) {

                console.error(
                    '관리자 멘션 전송 중 오류:',
                    error
                );

                await message.reply(
                    '❌ 관리자 멘션을 전송하는 중 오류가 발생했습니다.'
                );
            }

            return;
        }

        // ====================
        // 청소
        // ====================

        if (
            message.content === '.청소' ||
            message.content.startsWith('.청소 ')
        ) {

            if (!canClean(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const args =
                message.content
                    .trim()
                    .split(/\s+/);

            const amount =
                parseInt(
                    args[1],
                    10
                );

            if (
                !amount ||
                amount < 1 ||
                amount > 100
            ) {

                return message.reply(
                    '🧹 삭제할 메시지 개수를 1~100 사이로 입력해주세요.\n' +
                    '예시: `.청소 10`'
                );
            }

            try {

                const messages =
                    await message.channel.messages.fetch({
                        limit: amount
                    });

                const deletableMessages =
                    messages.filter(
                        msg =>
                            Date.now() -
                            msg.createdTimestamp <
                            14 *
                            24 *
                            60 *
                            60 *
                            1000
                    );

                const deletedMessages =
                    await message.channel.bulkDelete(
                        deletableMessages,
                        true
                    );

                const deletedCount =
                    deletedMessages.size;

                const cleanLogChannel =
                    message.guild.channels.cache.get(
                        CLEAN_LOG_CHANNEL_ID
                    );

                if (cleanLogChannel) {

                    const embed =
                        new EmbedBuilder()
                            .setTitle(
                                '🧹 메시지 청소'
                            )
                            .setDescription(
                                `👤 **관리자**\n` +
                                `${message.author}\n\n` +

                                `📌 **청소한 채널**\n` +
                                `${message.channel}\n\n` +

                                `🧹 **삭제된 메시지**\n` +
                                `**${deletedCount}개**`
                            )
                            .setTimestamp()
                            .setFooter({
                                text:
                                    '잔상봇 청소 로그'
                            });

                    await cleanLogChannel.send({
                        embeds: [embed]
                    }).catch(() => {});
                }

            } catch (error) {

                console.error(
                    '메시지 청소 중 오류:',
                    error
                );

                await message.reply(
                    '❌ 메시지를 삭제하는 중 오류가 발생했습니다.'
                );
            }

            return;
        }

        // ====================
        // 경고 지급
        // ====================

        if (
            message.content === '.경고' ||
            message.content.startsWith('.경고 ')
        ) {

            if (!canWarning(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const member =
                message.mentions.members.first();

            if (!member) {

                return message.reply(
                    '⚠️ 경고를 줄 멤버를 멘션해주세요.\n' +
                    '예시: `.경고 @멤버 욕설`\n' +
                    '여러 회 지급: `.경고 @멤버 2 욕설`'
                );
            }

            if (member.user.bot) {

                return message.reply(
                    '⚠️ 봇에게는 경고를 줄 수 없습니다.'
                );
            }

            const mentionRegex =
                /<@!?\d+>/;

            const mentionMatch =
                message.content.match(
                    mentionRegex
                );

            if (!mentionMatch) {

                return message.reply(
                    '❌ 멤버 멘션을 확인할 수 없습니다.'
                );
            }

            const afterMention =
                message.content
                    .slice(
                        mentionMatch.index +
                        mentionMatch[0].length
                    )
                    .trim();

            const args =
                afterMention
                    ? afterMention.split(/\s+/)
                    : [];

            let amount = 1;

            let reason =
                '사유 없음';

            if (
                args.length > 0 &&
                /^\d+$/.test(args[0])
            ) {

                amount =
                    parseInt(
                        args[0],
                        10
                    );

                reason =
                    args
                        .slice(1)
                        .join(' ') ||
                    '사유 없음';

            } else {

                reason =
                    args.join(' ') ||
                    '사유 없음';
            }

            if (amount < 1) {

                return message.reply(
                    '❌ 경고 지급 횟수는 1회 이상이어야 합니다.'
                );
            }

            const warningKey =
                `${message.guild.id}:${member.id}`;

            const currentWarnings =
                warnings.get(
                    warningKey
                ) || 0;

            const newWarnings =
                currentWarnings +
                amount;

            warnings.set(
                warningKey,
                newWarnings
            );

            saveWarnings();

            await message.reply(
                `⚠️ **경고가 부여되었습니다.**\n\n` +
                `👤 대상: ${member}\n` +
                `🛡️ 관리자: ${message.author}\n` +
                `📉 지급: **${amount}회**\n` +
                `📌 사유: ${reason}\n` +
                `🔢 누적 경고: **${newWarnings}회**`
            );

            await sendLog(
                message.guild,
                WARNING_ISSUE_LOG_CHANNEL_ID,
                '경고 부여',
                `👤 대상: ${member}\n` +
                `🛡️ 관리자: ${message.author}\n` +
                `📉 지급: **${amount}회**\n` +
                `📌 사유: ${reason}\n` +
                `🔢 누적 경고: **${newWarnings}회**`
            );

            return;
        }

        // ====================
        // 경고 확인
        // ====================

        if (
            message.content.startsWith(
                '.경고확인'
            )
        ) {

            if (!canWarning(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const member =
                message.mentions.members.first();

            if (!member) {

                return message.reply(
                    '📋 경고를 확인할 멤버를 멘션해주세요.\n' +
                    '예시: `.경고확인 @멤버`'
                );
            }

            const warningKey =
                `${message.guild.id}:${member.id}`;

            const currentWarnings =
                warnings.get(
                    warningKey
                ) || 0;

            await message.reply(
                `📋 **경고 조회**\n\n` +
                `👤 대상: ${member}\n` +
                `🔢 누적 경고: **${currentWarnings}회**`
            );

            return;
        }

        // ====================
        // 경고 차감
        // ====================

        if (
            message.content === '.경고차감' ||
            message.content.startsWith('.경고차감 ')
        ) {

            if (!canWarning(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const member =
                message.mentions.members.first();

            if (!member) {

                return message.reply(
                    '➖ 경고를 차감할 멤버를 멘션해주세요.\n' +
                    '예시: `.경고차감 @멤버`\n' +
                    '여러 회 차감: `.경고차감 @멤버 2`'
                );
            }

            const mentionRegex =
                /<@!?\d+>/;

            const mentionMatch =
                message.content.match(
                    mentionRegex
                );

            if (!mentionMatch) {

                return message.reply(
                    '❌ 멤버 멘션을 확인할 수 없습니다.'
                );
            }

            const afterMention =
                message.content
                    .slice(
                        mentionMatch.index +
                        mentionMatch[0].length
                    )
                    .trim();

            const args =
                afterMention
                    ? afterMention.split(/\s+/)
                    : [];

            let amount = 1;

            if (
                args.length > 0 &&
                /^\d+$/.test(args[0])
            ) {

                amount =
                    parseInt(
                        args[0],
                        10
                    );
            }

            if (amount < 1) {

                return message.reply(
                    '❌ 차감할 경고 횟수는 1회 이상이어야 합니다.'
                );
            }

            const warningKey =
                `${message.guild.id}:${member.id}`;

            const currentWarnings =
                warnings.get(
                    warningKey
                ) || 0;

            if (currentWarnings === 0) {

                return message.reply(
                    `❌ ${member}의 경고가 없습니다.`
                );
            }

            const deductedAmount =
                Math.min(
                    amount,
                    currentWarnings
                );

            const newWarnings =
                currentWarnings -
                deductedAmount;

            if (newWarnings === 0) {

                warnings.delete(
                    warningKey
                );

            } else {

                warnings.set(
                    warningKey,
                    newWarnings
                );
            }

            saveWarnings();

            await message.reply(
                `➖ **경고가 차감되었습니다.**\n\n` +
                `👤 대상: ${member}\n` +
                `🛡️ 관리자: ${message.author}\n` +
                `📉 차감: **${deductedAmount}회**\n` +
                `🔢 남은 경고: **${newWarnings}회**`
            );

            const warningDeductionLogChannel =
                message.guild.channels.cache.get(
                    WARNING_LOG_CHANNEL_ID
                );

            if (warningDeductionLogChannel) {

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            '➖ 경고 차감'
                        )
                        .setDescription(
                            `👤 **대상**\n${member}\n\n` +
                            `🛡️ **관리자**\n${message.author}\n\n` +
                            `📉 **차감**\n**${deductedAmount}회**\n\n` +
                            `🔢 **남은 경고**\n**${newWarnings}회**`
                        )
                        .setThumbnail(
                            member.user.displayAvatarURL({
                                dynamic: true
                            })
                        )
                        .setTimestamp()
                        .setFooter({
                            text:
                                '잔상봇 경고 차감 로그'
                        });

                await warningDeductionLogChannel.send({
                    embeds: [embed]
                }).catch(() => {});
            }

            return;
        }

        // ====================
        // 추방
        // ====================

        if (
            message.content.startsWith('.추방')
        ) {

            if (!canPunish(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const member =
                message.mentions.members.first();

            if (!member) {

                return message.reply(
                    '👢 추방할 멤버를 멘션해주세요.\n' +
                    '예시: `.추방 @멤버 사유`'
                );
            }

            if (!member.kickable) {

                return message.reply(
                    '❌ 해당 멤버를 추방할 수 없습니다.\n' +
                    '봇보다 높은 역할이거나 서버 소유자일 수 있습니다.'
                );
            }

            const mentionRegex =
                /<@!?\d+>/;

            const mentionMatch =
                message.content.match(
                    mentionRegex
                );

            const reason =
                mentionMatch
                    ? message.content
                        .slice(
                            mentionMatch.index +
                            mentionMatch[0].length
                        )
                        .trim() ||
                    '사유 없음'
                    : '사유 없음';

            const targetTag =
                member.user.tag;

            await member.kick(
                reason
            );

            await message.reply(
                `👢 **멤버를 추방했습니다.**\n\n` +
                `👤 대상: ${targetTag}\n` +
                `📌 사유: ${reason}`
            );

            await sendLog(
                message.guild,
                KICK_LOG_CHANNEL_ID,
                '멤버 추방',
                `👤 대상: **${targetTag}**\n` +
                `🛡️ 관리자: ${message.author}\n` +
                `📌 사유: ${reason}`
            );

            return;
        }

        // ====================
        // 밴
        // ====================

        if (
            message.content === '.밴' ||
            message.content.startsWith('.밴 ')
        ) {

            if (!canPunish(message.member)) {

                return message.reply(
                    '❌ 이 명령어는 서버 소유주만 사용할 수 있습니다.'
                );
            }

            const member =
                message.mentions.members.first();

            if (!member) {

                return message.reply(
                    '🔨 밴할 멤버를 멘션해주세요.\n' +
                    '예시: `.밴 @멤버 사유`'
                );
            }

            if (member.id === message.author.id) {

                return message.reply(
                    '❌ 자신은 밴할 수 없습니다.'
                );
            }

            if (!member.bannable) {

                return message.reply(
                    '❌ 해당 멤버를 밴할 수 없습니다.\n' +
                    '봇보다 높은 역할이거나 서버 소유자일 수 있습니다.'
                );
            }

            const mentionRegex =
                /<@!?\d+>/;

            const mentionMatch =
                message.content.match(
                    mentionRegex
                );

            const reason =
                mentionMatch
                    ? message.content
                        .slice(
                            mentionMatch.index +
                            mentionMatch[0].length
                        )
                        .trim() ||
                    '사유 없음'
                    : '사유 없음';

            const targetTag =
                member.user.tag;

            const targetUser =
                member.user;

            // ====================
            // 밴 대상자 DM
            // ====================

            try {

                await targetUser.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(
                                '🔨 잔상 서버 영구 차단 안내'
                            )
                            .setDescription(
                                `안녕하세요.\n` +
                                `잔상 서버에서 **영구 차단** 처리되었습니다.\n\n` +

                                `📌 **차단 사유**\n` +
                                `${reason}\n\n` +

                                `🛡️ **처리자**\n` +
                                `${message.author.tag}\n\n` +

                                `🆔 **사용자 ID**\n` +
                                `\`${member.id}\``
                            )
                            .setTimestamp()
                            .setFooter({
                                text:
                                    '잔상봇 영구차단 안내'
                            })
                    ]
                });

            } catch (dmError) {

                console.log(
                    `[밴 DM 실패] ${targetTag} - DM을 보낼 수 없습니다.`
                );
            }

            // ====================
            // 실제 밴 처리
            // ====================

            try {

                await member.ban({
                    reason
                });

            } catch (error) {

                console.error(
                    '멤버 밴 중 오류:',
                    error
                );

                return message.reply(
                    '❌ 해당 멤버를 밴하는 중 오류가 발생했습니다.'
                );
            }

            // ====================
            // 영구차단 로그
            // ====================

            const permanentBanLogChannel =
                message.guild.channels.cache.get(
                    PERMANENT_BAN_LOG_CHANNEL_ID
                );

            if (permanentBanLogChannel) {

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            '🔨 영구차단'
                        )
                        .setDescription(
                            `👤 **대상자**\n` +
                            `${targetTag}\n\n` +

                            `🆔 **사용자 ID**\n` +
                            `\`${member.id}\`\n\n` +

                            `🛡️ **처리자**\n` +
                            `${message.author}\n\n` +

                            `📌 **차단 사유**\n` +
                            `${reason}`
                        )
                        .setThumbnail(
                            targetUser.displayAvatarURL({
                                dynamic: true
                            })
                        )
                        .setTimestamp()
                        .setFooter({
                            text:
                                '잔상봇 영구차단 기록'
                        });

                await permanentBanLogChannel.send({
                    embeds: [embed]
                }).catch(() => {});
            }

            await message.reply(
                `🔨 **멤버를 영구 차단했습니다.**\n\n` +
                `👤 대상: ${targetTag}\n` +
                `🆔 사용자 ID: \`${member.id}\`\n` +
                `📌 사유: ${reason}\n\n` +
                `📋 영구차단 채널에 기록되었습니다.`
            );

            return;
        }

        // ====================
        // 밴 해제
        // ====================

        if (
            message.content === '.밴해제' ||
            message.content.startsWith('.밴해제 ')
        ) {

            if (!canPunish(message.member)) {

                return message.reply(
                    '❌ 이 명령어는 서버 소유주만 사용할 수 있습니다.'
                );
            }

            const args =
                message.content
                    .trim()
                    .split(/\s+/);

            const userId =
                args[1];

            if (!userId) {

                return message.reply(
                    '🔓 밴을 해제할 사용자 ID를 입력해주세요.\n' +
                    '예시: `.밴해제 123456789012345678 사유`'
                );
            }

            if (!/^\d{17,20}$/.test(userId)) {

                return message.reply(
                    '❌ 올바른 Discord 사용자 ID를 입력해주세요.'
                );
            }

            const reason =
                args
                    .slice(2)
                    .join(' ')
                    .trim() ||
                '사유 없음';

            let bannedUser;

            // ====================
            // 밴 목록 확인
            // ====================

            try {

                bannedUser =
                    await message.guild.bans.fetch(
                        userId
                    );

            } catch (error) {

                return message.reply(
                    '❌ 해당 사용자는 현재 서버에서 밴되어 있지 않거나 사용자 ID를 확인할 수 없습니다.'
                );
            }

            const targetTag =
                bannedUser.user.tag;

            // ====================
            // 밴 해제
            // ====================

            try {

                await message.guild.members.unban(
                    userId,
                    reason
                );

            } catch (error) {

                console.error(
                    '밴 해제 중 오류:',
                    error
                );

                return message.reply(
                    '❌ 해당 사용자의 밴을 해제하는 중 오류가 발생했습니다.'
                );
            }

            // ====================
            // 영구차단 해제 로그
            // ====================

            const permanentUnbanLogChannel =
                message.guild.channels.cache.get(
                    PERMANENT_UNBAN_LOG_CHANNEL_ID
                );

            if (permanentUnbanLogChannel) {

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            '🔓 영구차단 해제'
                        )
                        .setDescription(
                            `👤 **대상자**\n` +
                            `${targetTag}\n\n` +

                            `🆔 **사용자 ID**\n` +
                            `\`${userId}\`\n\n` +

                            `🛡️ **처리자**\n` +
                            `${message.author}\n\n` +

                            `📌 **해제 사유**\n` +
                            `${reason}`
                        )
                        .setThumbnail(
                            bannedUser.user.displayAvatarURL({
                                dynamic: true
                            })
                        )
                        .setTimestamp()
                        .setFooter({
                            text:
                                '잔상봇 영구차단 해제 기록'
                        });

                await permanentUnbanLogChannel.send({
                    embeds: [embed]
                }).catch(() => {});
            }

            await message.reply(
                `🔓 **영구차단을 해제했습니다.**\n\n` +
                `👤 대상: ${targetTag}\n` +
                `🆔 사용자 ID: \`${userId}\`\n` +
                `📌 해제 사유: ${reason}\n\n` +
                `📋 영구차단 해제 채널에 기록되었습니다.`
            );

            return;
        }

        // ====================
        // 서버 정보
        // ====================

        if (
            message.content === '.서버정보'
        ) {

            if (!canViewServerInfo(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const guild =
                message.guild;

            const owner =
                await guild.fetchOwner();

            await message.reply(
                `🏠 **${guild.name} 서버 정보**\n\n` +
                `👥 멤버 수: **${guild.memberCount}명**\n` +
                `👑 서버 소유자: **${owner.user.tag}**\n` +
                `📅 서버 생성일: **${guild.createdAt.toLocaleDateString('ko-KR')}**`
            );

            return;
        }

        // ====================
        // 유저 정보
        // ====================

        if (
            message.content.startsWith('.유저정보')
        ) {

            if (!canViewUserInfo(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            const member =
                message.mentions.members.first();

            if (!member) {

                return message.reply(
                    '👤 정보를 확인할 멤버를 멘션해주세요.\n' +
                    '예시: `.유저정보 @멤버`'
                );
            }

            const roles =
                member.roles.cache
                    .filter(
                        role =>
                            role.id !==
                            message.guild.id
                    )
                    .map(
                        role =>
                            role.toString()
                    )
                    .join(', ') ||
                '없음';

            const userCreated =
                member.user.createdAt
                    .toLocaleDateString(
                        'ko-KR'
                    );

            const joinedServer =
                member.joinedAt
                    ? member.joinedAt.toLocaleDateString(
                        'ko-KR'
                    )
                    : '확인할 수 없음';

            await message.reply(
                `👤 **유저 정보**\n\n` +
                `📌 닉네임: **${member.displayName}**\n` +
                `🪪 디스코드 태그: **${member.user.tag}**\n` +
                `🆔 사용자 ID: **${member.id}**\n` +
                `📅 디스코드 가입일: **${userCreated}**\n` +
                `📅 서버 가입일: **${joinedServer}**\n` +
                `🎭 역할: ${roles}`
            );

            return;
        }

        // ====================
        // 게임 역할 선택판
        // ====================

        if (
            message.content === '.게임역할'
        ) {

            const buttons = [

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_battlegrounds'
                    )
                    .setLabel(
                        '배틀그라운드'
                    )
                    .setEmoji(
                        '🎖️'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_roblox'
                    )
                    .setLabel(
                        '로블록스'
                    )
                    .setEmoji(
                        '🧱'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_valorant'
                    )
                    .setLabel(
                        '발로란트'
                    )
                    .setEmoji(
                        '🔫'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_league'
                    )
                    .setLabel(
                        '리그오브레전드'
                    )
                    .setEmoji(
                        '🏆'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_steam'
                    )
                    .setLabel(
                        '스팀게임'
                    )
                    .setEmoji(
                        '🎮'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_other'
                    )
                    .setLabel(
                        '기타게임'
                    )
                    .setEmoji(
                        '🎲'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        'game_role_minecraft'
                    )
                    .setLabel(
                        '마인크래프트'
                    )
                    .setEmoji(
                        '⛏️'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    )
            ];

            const row1 =
                new ActionRowBuilder()
                    .addComponents(
                        buttons[0],
                        buttons[1],
                        buttons[2],
                        buttons[3],
                        buttons[4]
                    );

            const row2 =
                new ActionRowBuilder()
                    .addComponents(
                        buttons[5],
                        buttons[6]
                    );

            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            '🎮 게임 역할 선택'
                        )
                        .setDescription(
                            '원하는 게임의 버튼을 눌러 역할을 받아보세요.\n\n' +
                            '✅ 버튼을 누르면 역할이 지급됩니다.\n' +
                            '❌ 이미 가지고 있는 역할의 버튼을 다시 누르면 역할이 회수됩니다.\n\n' +
                            '여러 게임 역할을 동시에 선택할 수 있습니다.'
                        )
                        .setFooter({
                            text:
                                '잔상봇 게임 역할 시스템'
                        })
                ],
                components: [
                    row1,
                    row2
                ]
            });

            await message.delete()
                .catch(() => {});

            return;
        }

        // ====================
        // 반응 역할판 생성
        // ====================

        if (
            message.content === '.역할판' ||
            message.content.startsWith('.역할판 ')
        ) {

            if (!canPunish(message.member)) {

                return message.reply(
                    '❌ 이 명령어는 서버 소유주만 사용할 수 있습니다.'
                );
            }

            const args =
                message.content
                    .trim()
                    .split(/\s+/)
                    .slice(1);

            if (
                args.length < 2 ||
                args.length % 2 !== 0 ||
                args.length > 40
            ) {

                return message.reply(
                    '🎭 반응 이모지와 역할 멘션을 짝으로 입력해주세요.\n' +
                    '예시: `.역할판 😀 @역할1 🎮 @역할2`\n' +
                    '한 판에는 최대 20개 역할까지 설정할 수 있습니다.'
                );
            }

            const roleEntries = [];
            const usedEmojiKeys = new Set();
            const usedRoleIds = new Set();

            for (
                let index = 0;
                index < args.length;
                index += 2
            ) {
                const emoji =
                    args[index];

                const roleMention =
                    args[index + 1].match(
                        /^<@&(\d+)>$/
                    );

                if (!roleMention) {

                    return message.reply(
                        `❌ ${args[index + 1]}은(는) 역할 멘션이 아닙니다.\n` +
                        '각 이모지 뒤에 역할을 멘션해주세요.'
                    );
                }

                const customEmoji =
                    emoji.match(
                        /^<a?:[A-Za-z0-9_]+:(\d+)>$/
                    );

                const emojiKey =
                    customEmoji
                        ? customEmoji[1]
                        : emoji;

                if (usedEmojiKeys.has(emojiKey)) {

                    return message.reply(
                        `❌ ${emoji} 이모지가 중복되었습니다.`
                    );
                }

                if (usedRoleIds.has(roleMention[1])) {

                    return message.reply(
                        '❌ 하나의 역할은 한 번만 등록할 수 있습니다.'
                    );
                }

                const role =
                    message.guild.roles.cache.get(
                        roleMention[1]
                    );

                if (!role) {

                    return message.reply(
                        `❌ ${args[index + 1]} 역할을 찾을 수 없습니다.`
                    );
                }

                if (!role.editable) {

                    return message.reply(
                        `❌ ${role} 역할은 봇이 관리할 수 없습니다.\n` +
                        '봇의 역할보다 아래에 있는 역할만 등록할 수 있습니다.'
                    );
                }

                usedEmojiKeys.add(
                    emojiKey
                );

                usedRoleIds.add(
                    role.id
                );

                roleEntries.push({
                    emoji,
                    emojiKey,
                    role
                });
            }

            const botMember =
                message.guild.members.me ||
                await message.guild.members.fetchMe();

            if (
                !botMember.permissions.has(
                    PermissionsBitField.Flags.ManageRoles
                )
            ) {

                return message.reply(
                    '❌ 봇에게 역할 관리 권한이 없습니다.'
                );
            }

            let panelMessage;

            try {

                panelMessage =
                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    '🎭 역할 선택'
                                )
                                .setDescription(
                                    '원하는 이모지를 눌러 역할을 받으세요.\n' +
                                    '반응을 취소하면 해당 역할이 회수됩니다.\n\n' +
                                    roleEntries
                                        .map(
                                            entry =>
                                                `${entry.emoji} — ${entry.role}`
                                        )
                                        .join('\n')
                                )
                                .setFooter({
                                    text:
                                        '잔상봇 반응 역할 시스템'
                                })
                        ]
                    });

                for (const entry of roleEntries) {
                    await panelMessage.react(
                        entry.emoji
                    );
                }

                reactionRolePanels.set(
                    panelMessage.id,
                    {
                        guildId:
                            message.guild.id,
                        roleByEmoji:
                            Object.fromEntries(
                                roleEntries.map(
                                    entry => [
                                        entry.emojiKey,
                                        entry.role.id
                                    ]
                                )
                            )
                    }
                );

                saveReactionRolePanels();

            } catch (error) {

                reactionRolePanels.delete(
                    panelMessage?.id
                );

                if (panelMessage) {
                    await panelMessage.delete()
                        .catch(cleanupError => {
                            console.error(
                                '반응 역할판 정리 중 오류:',
                                cleanupError
                            );
                        });
                }

                console.error(
                    '반응 역할판 생성 중 오류:',
                    error
                );

                return message.reply(
                    '❌ 역할판을 생성하지 못했습니다. 이모지가 유효한지, 봇에 메시지 전송·반응 추가·역할 관리 권한이 있는지 확인해주세요.'
                );
            }

            await message.reply(
                `✅ 반응 역할판을 생성했습니다.\n📌 채널: ${message.channel}`
            );

            return;
        }

        // ====================
        // 티켓 안내판 생성
        // ====================

        if (
            message.content === '.티켓'
        ) {

            if (!canCreateTicketPanel(message.member)) {

                return message.reply(
                    '❌ 이 명령어는 서버 소유주만 사용할 수 있습니다.'
                );
            }

            const button =
                new ButtonBuilder()
                    .setCustomId(
                        'open_ticket'
                    )
                    .setLabel(
                        '티켓 열기'
                    )
                    .setEmoji(
                        '🎫'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    );

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        button
                    );

            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            '🎫 신고 / 문의 티켓'
                        )
                        .setDescription(
                            '문의사항이나 신고할 내용이 있다면 아래 버튼을 눌러주세요.\n\n' +
                            '🎫 **티켓 열기** 버튼을 누르면\n' +
                            '관리진에게 문의할 수 있는 개인 신고 채널이 생성됩니다.\n\n' +
                            '※ 서버원 역할이 있는 멤버만 티켓을 열 수 있습니다.'
                        )
                        .setFooter({
                            text:
                                '잔상봇 티켓 시스템'
                        })
                ],
                components: [row]
            });

            await message.delete()
                .catch(() => {});

            return;
        }

        // ====================
        // 티켓 닫기
        // ====================

        if (
            message.content === '.티켓닫기'
        ) {

            const channel =
                message.channel;

            if (
                !channel.topic ||
                !channel.topic.startsWith(
                    '신고자:'
                )
            ) {

                return message.reply(
                    '❌ 이 명령어는 신고 채널에서만 사용할 수 있습니다.'
                );
            }

            if (!canCloseTicket(message.member)) {

                return message.reply(
                    '❌ 이 명령어를 사용할 권한이 없습니다.'
                );
            }

            await message.reply(
                '🔒 **신고 채널을 닫습니다.**'
            );

            await sendLog(
                message.guild,
                TICKET_LOG_CHANNEL_ID,
                '신고 채널 삭제',
                `🛡️ 관리자: ${message.author}\n` +
                `📌 채널: ${channel.name}`
            );

            setTimeout(
                () => {
                    channel
                        .delete()
                        .catch(() => {});
                },
                2000
            );

            return;
        }
    }
);

// ====================
// 버튼 상호작용
// ====================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) return;

        const guild =
            interaction.guild;

        if (!guild) return;

        // ====================
        // 게임 역할 버튼
        // ====================

        const gameRoles = {

            game_role_battlegrounds: {
                roleId:
                    GAME_ROLE_IDS.battlegrounds,
                name:
                    '배틀그라운드'
            },

            game_role_roblox: {
                roleId:
                    GAME_ROLE_IDS.roblox,
                name:
                    '로블록스'
            },

            game_role_valorant: {
                roleId:
                    GAME_ROLE_IDS.valorant,
                name:
                    '발로란트'
            },

            game_role_league: {
                roleId:
                    GAME_ROLE_IDS.league,
                name:
                    '리그오브레전드'
            },

            game_role_steam: {
                roleId:
                    GAME_ROLE_IDS.steam,
                name:
                    '스팀게임'
            },

            game_role_other: {
                roleId:
                    GAME_ROLE_IDS.other,
                name:
                    '기타게임'
            },

            game_role_minecraft: {
                roleId:
                    GAME_ROLE_IDS.minecraft,
                name:
                    '마인크래프트'
            }
        };

        const selectedGame =
            gameRoles[
                interaction.customId
            ];

        if (selectedGame) {

            const member =
                interaction.member;

            const role =
                guild.roles.cache.get(
                    selectedGame.roleId
                );

            if (!role) {

                return interaction.reply({
                    content:
                        '❌ 해당 역할을 찾을 수 없습니다.',
                    ephemeral: true
                });
            }

            const botMember =
                guild.members.me ||
                await guild.members.fetchMe();

            const botHighestRole =
                botMember.roles.highest;

            if (
                role.position >=
                botHighestRole.position
            ) {

                return interaction.reply({
                    content:
                        '❌ 해당 역할이 봇의 역할보다 높거나 같은 위치에 있어 지급할 수 없습니다.\n\n' +
                        '서버 설정에서 잔상봇의 역할을 해당 게임 역할보다 위로 올려주세요.',
                    ephemeral: true
                });
            }

            try {

                if (
                    member.roles.cache.has(
                        role.id
                    )
                ) {

                    await member.roles.remove(
                        role
                    );

                    return interaction.reply({
                        content:
                            `❌ **${selectedGame.name}** 역할을 회수했습니다.`,
                        ephemeral: true
                    });
                }

                await member.roles.add(
                    role
                );

                return interaction.reply({
                    content:
                        `✅ **${selectedGame.name}** 역할을 지급했습니다.`,
                    ephemeral: true
                });

            } catch (error) {

                console.error(
                    '게임 역할 처리 중 오류:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ 역할을 처리하는 중 오류가 발생했습니다.\n' +
                        '봇에게 **역할 관리** 권한이 있는지 확인해주세요.',
                    ephemeral: true
                });
            }
        }

        // ====================
        // 티켓 버튼이 아니면 종료
        // ====================

        if (
            interaction.customId !==
            'open_ticket'
        ) return;

        // ====================
        // 서버원만 티켓 열기 가능
        // ====================

        if (
            !canOpenTicket(
                interaction.member
            )
        ) {

            return interaction.reply({
                content:
                    '❌ 서버원 역할이 있는 멤버만 티켓을 열 수 있습니다.',
                ephemeral: true
            });
        }

        const categoryId =
            TICKET_CATEGORY_ID;

        const category =
            guild.channels.cache.get(
                categoryId
            );

        if (!category) {

            return interaction.reply({
                content:
                    '❌ 신고 카테고리를 찾을 수 없습니다.',
                ephemeral: true
            });
        }

        // ====================
        // 기존 티켓 확인
        // ====================

        const existingChannel =
            guild.channels.cache.find(
                channel =>
                    channel.parentId ===
                        categoryId &&
                    channel.topic ===
                        `신고자:${interaction.user.id}`
            );

        if (existingChannel) {

            return interaction.reply({
                content:
                    `❌ 이미 생성된 신고 채널이 있습니다.\n${existingChannel}`,
                ephemeral: true
            });
        }

        try {

            // ====================
            // 티켓 채널 생성
            // ====================

            const channel =
                await guild.channels.create({

                    name:
                        `신고-${interaction.user.username}`,

                    type: 0,

                    parent:
                        categoryId,

                    topic:
                        `신고자:${interaction.user.id}`,

                    permissionOverwrites: [

                        {
                            id:
                                guild.roles
                                    .everyone.id,

                            deny: [
                                PermissionsBitField.Flags.ViewChannel
                            ]
                        },

                        {
                            id:
                                interaction.user.id,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        },

                        {
                            id:
                                client.user.id,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ManageChannels
                            ]
                        },

                        {
                            id:
                                ROLE_IDS.security,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        },

                        {
                            id:
                                ROLE_IDS.viceOwner,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        },

                        {
                            id:
                                ROLE_IDS.representative,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        },

                        {
                            id:
                                ROLE_IDS.admin,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        },

                        {
                            id:
                                ROLE_IDS.adminAdditional,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        },

                        {
                            id:
                                ROLE_IDS.owner,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        }
                    ]
                });

            // ====================
            // 티켓 안내 메시지
            // ====================

            await channel.send(
                `🎫 **신고 접수 채널입니다.**\n\n` +
                `👤 신고자: <@${interaction.user.id}>\n` +
                `📝 신고 내용을 이 채널에 작성해주세요.\n\n` +
                `관리진이 확인 후 처리해드립니다.\n` +
                `🔒 신고가 끝나면 관리진이 \`.티켓닫기\`를 사용해 채널을 닫습니다.`
            );

            // ====================
            // 사용자에게 알림
            // ====================

            await interaction.reply({
                content:
                    `✅ 신고 채널이 생성되었습니다.\n${channel}`,
                ephemeral: true
            });

            // ====================
            // 로그
            // ====================

            await sendLog(
                guild,
                TICKET_LOG_CHANNEL_ID,
                '신고 채널 생성',
                `👤 신고자: ${interaction.user}\n` +
                `📌 채널: ${channel}`
            );

        } catch (error) {

            console.error(
                '티켓 생성 중 오류:',
                error
            );

            if (!interaction.replied) {

                await interaction.reply({
                    content:
                        '❌ 티켓을 생성하는 중 오류가 발생했습니다.',
                    ephemeral: true
                });
            }
        }
    }
);

async function updateReactionRole(
    reaction,
    user,
    shouldHaveRole
) {
    if (user.bot) return;

    try {
        if (reaction.partial) {
            await reaction.fetch();
        }

        if (user.partial) {
            await user.fetch();
        }

        const panel =
            reactionRolePanels.get(
                reaction.message.id
            );

        if (
            !panel ||
            panel.guildId !== reaction.message.guildId
        ) return;

        const emojiKey =
            reaction.emoji.id ||
            reaction.emoji.name;

        const roleId =
            panel.roleByEmoji[emojiKey];

        if (!roleId) return;

        const guild =
            reaction.message.guild;

        if (!guild) return;

        const [member, role] =
            await Promise.all([
                guild.members.fetch(user.id),
                guild.roles.fetch(roleId)
            ]);

        if (!role) {
            console.error(
                `[반응 역할 오류] 역할을 찾을 수 없습니다: ${roleId}`
            );
            return;
        }

        if (!role.editable) {
            console.error(
                `[반응 역할 오류] 봇이 역할을 관리할 수 없습니다: ${roleId}`
            );
            return;
        }

        if (shouldHaveRole) {
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
            }
        } else if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
        }

    } catch (error) {
        console.error(
            '반응 역할 처리 중 오류:',
            error
        );
    }
}

client.on(
    'messageReactionAdd',
    async (reaction, user) => {
        await updateReactionRole(
            reaction,
            user,
            true
        );
    }
);

client.on(
    'messageReactionRemove',
    async (reaction, user) => {
        await updateReactionRole(
            reaction,
            user,
            false
        );
    }
);

// ====================
// 봇 로그인
// ====================

client.login(
    process.env.DISCORD_TOKEN
);