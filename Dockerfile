FROM node:20.9.0 AS builder
WORKDIR ./app

COPY package.json package-lock.json ./
RUN npm install

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

COPY . .
RUN npm run build
# 2. 실행 단계 (매우 가벼운 Node 이미지 사용)
FROM node:18-alpine AS runner
WORKDIR /app

# 1. docker-compose에서 보낸 args 받기
ARG NEXT_PUBLIC_AI_API_URL

# 2. 환경변수로 등록 (빌드 도중 사용 가능하게)
ENV NEXT_PUBLIC_AI_API_URL=$NEXT_PUBLIC_AI_API_URL

# 보안을 위해 nextjs 유저 생성 및 사용 (선택사항이나 권장됨)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 중 필요한 것만 쏙쏙 복사 (Standalone 모드의 장점)
# .next/standalone 폴더에는 실행에 필요한 최소한의 파일만 들어있음
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# 0.0.0.0으로 열어야 도커 밖에서 접속 가능
ENV HOSTNAME="0.0.0.0"

# 실행 명령어 (server.js가 자동으로 생성됨)
CMD ["node", "server.js"]