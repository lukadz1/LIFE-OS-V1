// Form reference content for the exercise library. Written for this app —
// generic strength-coaching cues, not sourced from any single program.

export interface ExerciseInfo {
  muscles: string[];
  tier: 1 | 2 | 3;
  equipment: string;
  tagline: string;
  cues: string[];
  tags: string[];
  coaching: string;
}

const INFO: Record<string, ExerciseInfo> = {
  "Bench Press": {
    muscles: ["Chest", "Front Delts", "Triceps"],
    tier: 1,
    equipment: "Barbell",
    tagline: "The barbell chest builder.",
    cues: ["Unrack over your chest", "Lower slow to your sternum", "Press up and squeeze"],
    tags: ["Lower slower than you press", "Squeeze chest at lockout"],
    coaching:
      "Wrists stacked over elbows. Tuck the elbows slightly, drive through the mid-foot, hold a slight arch.",
  },
  "Incline Bench Press": {
    muscles: ["Upper Chest", "Front Delts", "Triceps"],
    tier: 1,
    equipment: "Barbell",
    tagline: "Builds the top of the chest.",
    cues: ["Set the bench to 30–45°", "Lower to the upper chest", "Drive up and slightly back"],
    tags: ["Keep the arch modest", "Don't flare elbows to 90°"],
    coaching:
      "A shallow incline hits the upper chest without turning it into a shoulder press — keep the bar path over the collarbone.",
  },
  "Dumbbell Bench Press": {
    muscles: ["Chest", "Front Delts", "Triceps"],
    tier: 2,
    equipment: "Dumbbell",
    tagline: "More range, more control.",
    cues: ["Kick the dumbbells up together", "Lower until upper arms are level with the bench", "Press up and in"],
    tags: ["Let the dumbbells rotate naturally", "Don't clang them at the top"],
    coaching:
      "The extra range under load builds the stretch strength barbell work can miss — control the descent.",
  },
  "Chest Fly": {
    muscles: ["Chest"],
    tier: 3,
    equipment: "Dumbbell",
    tagline: "Isolation for the stretch.",
    cues: ["Soft bend in the elbows", "Open wide until you feel the stretch", "Hug the arms back together"],
    tags: ["Lead with the wrists, not the elbows", "Stop before the shoulder rounds forward"],
    coaching:
      "This is a stretch-and-squeeze move, not a pressing move — keep the elbow angle fixed throughout.",
  },
  "Cable Crossover": {
    muscles: ["Chest"],
    tier: 3,
    equipment: "Cable",
    tagline: "Constant tension, top to bottom.",
    cues: ["Set pulleys above head height", "Cross hands at the bottom", "Squeeze through full contraction"],
    tags: ["Lean forward slightly for stability", "Control the eccentric"],
    coaching:
      "Cables keep tension on the chest even in the fully contracted position, where free weights go slack.",
  },
  "Push-up": {
    muscles: ["Chest", "Front Delts", "Triceps", "Core"],
    tier: 2,
    equipment: "Bodyweight",
    tagline: "The original chest builder.",
    cues: ["Hands under shoulders", "Lower with elbows at ~45°", "Press the floor away"],
    tags: ["Keep hips level with shoulders", "Full lockout at the top"],
    coaching:
      "Treat it as a moving plank — a sagging or piked hip both bleed tension from the chest.",
  },
  Dip: {
    muscles: ["Chest", "Triceps", "Front Delts"],
    tier: 2,
    equipment: "Bars",
    tagline: "Bodyweight pressing, loaded deep.",
    cues: ["Lean forward for chest emphasis", "Lower until shoulders dip below elbows", "Press back up to lockout"],
    tags: ["Add weight once bodyweight is easy", "Stay controlled at the bottom"],
    coaching:
      "The deeper stretch at the bottom is where the chest work happens — don't cut the range short.",
  },
  Deadlift: {
    muscles: ["Back", "Glutes", "Hamstrings"],
    tier: 1,
    equipment: "Barbell",
    tagline: "The full-body strength standard.",
    cues: ["Bar over mid-foot", "Brace, then push the floor away", "Lock out with hips and knees together"],
    tags: ["Keep the bar close the whole way", "Exhale after lockout, not before"],
    coaching:
      "This is a push, not a pull — think of driving the floor away from you rather than yanking the bar up.",
  },
  "Barbell Row": {
    muscles: ["Back", "Rear Delts", "Biceps"],
    tier: 1,
    equipment: "Barbell",
    tagline: "Builds a thick, wide back.",
    cues: ["Hinge to roughly 45°", "Row to the lower ribs", "Squeeze the shoulder blades together"],
    tags: ["Keep the torso angle fixed", "Don't use momentum to heave it up"],
    coaching:
      "A stable torso is what makes this a back exercise instead of a lower-back workout — brace before every rep.",
  },
  "Pull-up": {
    muscles: ["Lats", "Biceps", "Rear Delts"],
    tier: 1,
    equipment: "Bodyweight",
    tagline: "The benchmark pulling move.",
    cues: ["Start from a dead hang", "Pull the chest to the bar", "Lower under control"],
    tags: ["Lead with the elbows, not the hands", "Full extension at the bottom"],
    coaching:
      "Depth is what separates a real pull-up from a partial one — reset to a dead hang every rep.",
  },
  "Chin-up": {
    muscles: ["Lats", "Biceps"],
    tier: 1,
    equipment: "Bodyweight",
    tagline: "More biceps, same back work.",
    cues: ["Underhand grip, shoulder width", "Pull chest toward the bar", "Lower to full extension"],
    tags: ["Keep the elbows tucked", "Avoid kipping the legs"],
    coaching:
      "The supinated grip lets the biceps assist more, making this the easier cousin of the pull-up.",
  },
  "Lat Pulldown": {
    muscles: ["Lats", "Biceps"],
    tier: 2,
    equipment: "Cable",
    tagline: "A pull-up you can load precisely.",
    cues: ["Grip just outside shoulder width", "Pull the bar to the upper chest", "Control it back up"],
    tags: ["Lean back only slightly", "Don't yank with body english"],
    coaching:
      "Think 'elbows to hips' rather than 'hands to chest' — it keeps the lats doing the work instead of the arms.",
  },
  "Seated Cable Row": {
    muscles: ["Back", "Rear Delts", "Biceps"],
    tier: 2,
    equipment: "Cable",
    tagline: "Horizontal pulling, seated and stable.",
    cues: ["Sit tall, slight knee bend", "Row to the stomach", "Squeeze blades, then release with control"],
    tags: ["Don't rock the torso for momentum", "Pause briefly at full contraction"],
    coaching:
      "Let the shoulder blades do the last inch of the movement — rowing further with the arms alone just adds momentum.",
  },
  "T-Bar Row": {
    muscles: ["Back", "Rear Delts", "Biceps"],
    tier: 2,
    equipment: "Barbell",
    tagline: "Heavy rowing, close grip.",
    cues: ["Hinge and brace the torso", "Row the handle to the chest", "Lower with control"],
    tags: ["Keep the chest up, not rounded", "Drive elbows back, not out"],
    coaching:
      "The neutral grip and close handle let you row heavier than a barbell row while staying just as strict.",
  },
  "Back Squat": {
    muscles: ["Quads", "Glutes", "Core"],
    tier: 1,
    equipment: "Barbell",
    tagline: "The lower-body foundation.",
    cues: ["Bar on the upper traps", "Break at hips and knees together", "Drive up through mid-foot"],
    tags: ["Chest stays proud throughout", "Knees track over the toes"],
    coaching:
      "Depth should come from hip and ankle mobility, not from letting the lower back round at the bottom.",
  },
  "Front Squat": {
    muscles: ["Quads", "Core", "Upper Back"],
    tier: 1,
    equipment: "Barbell",
    tagline: "Quad-dominant, upright torso.",
    cues: ["Bar rests on the front delts", "Elbows high throughout", "Sit straight down between the hips"],
    tags: ["Keep the torso vertical", "Don't let the elbows drop"],
    coaching:
      "Elbow height is what keeps the bar from rolling off — if they drop, the whole rep falls apart.",
  },
  "Romanian Deadlift": {
    muscles: ["Hamstrings", "Glutes"],
    tier: 2,
    equipment: "Barbell",
    tagline: "Hip hinge for the posterior chain.",
    cues: ["Soft knee bend, fixed throughout", "Push hips back, bar close to the legs", "Stop when hamstrings are fully stretched"],
    tags: ["Keep the spine neutral", "Bar stays in contact with the legs"],
    coaching:
      "This is a hinge, not a squat — the knees barely bend while the hips travel back and down.",
  },
  "Leg Press": {
    muscles: ["Quads", "Glutes"],
    tier: 2,
    equipment: "Machine",
    tagline: "Squat volume without the balance demand.",
    cues: ["Feet shoulder width on the plate", "Lower until knees reach ~90°", "Press through the whole foot"],
    tags: ["Don't let the lower back round off the pad", "Avoid locking the knees hard at the top"],
    coaching:
      "Foot placement changes the emphasis — higher on the plate biases glutes and hamstrings, lower biases quads.",
  },
  "Walking Lunge": {
    muscles: ["Quads", "Glutes"],
    tier: 2,
    equipment: "Dumbbell",
    tagline: "Unilateral leg strength, moving.",
    cues: ["Step long enough for a 90° front knee", "Drop the back knee toward the floor", "Drive through the front heel to the next step"],
    tags: ["Keep the torso upright", "Let the back heel lift naturally"],
    coaching:
      "A longer step shifts work to the glutes; a shorter step keeps more of it on the quads.",
  },
  "Leg Extension": {
    muscles: ["Quads"],
    tier: 3,
    equipment: "Machine",
    tagline: "Pure quad isolation.",
    cues: ["Align the knee with the machine's pivot", "Extend to full lockout", "Lower under control"],
    tags: ["Point toes straight ahead", "Pause briefly at the top"],
    coaching:
      "No other muscle can bail you out here — if the quad stalls, the rep stalls.",
  },
  "Leg Curl": {
    muscles: ["Hamstrings"],
    tier: 3,
    equipment: "Machine",
    tagline: "Pure hamstring isolation.",
    cues: ["Pad sits just above the heel", "Curl through full range", "Lower with control, don't let it snap back"],
    tags: ["Keep the hips pinned to the pad", "Avoid using momentum"],
    coaching:
      "Controlling the negative is where most of the hamstring growth stimulus actually comes from.",
  },
  "Calf Raise": {
    muscles: ["Calves"],
    tier: 3,
    equipment: "Machine",
    tagline: "Full range for the lower leg.",
    cues: ["Start from a full stretch at the bottom", "Rise onto the balls of the feet", "Pause at the top before lowering"],
    tags: ["Don't bounce out of the bottom", "Control the full range every rep"],
    coaching:
      "Calves respond to time under tension and range — rushing the bottom stretch is the most common mistake.",
  },
  "Overhead Press": {
    muscles: ["Shoulders", "Triceps", "Upper Chest"],
    tier: 1,
    equipment: "Barbell",
    tagline: "The standing pressing standard.",
    cues: ["Bar starts at the collarbone", "Press straight up, head moves through at lockout", "Lower under control"],
    tags: ["Brace the core, don't lean back", "Squeeze glutes to keep the hips still"],
    coaching:
      "The bar path should be a straight line — pressing it in an arc usually means the core isn't locked down.",
  },
  "Dumbbell Shoulder Press": {
    muscles: ["Shoulders", "Triceps"],
    tier: 2,
    equipment: "Dumbbell",
    tagline: "Independent pressing, more range.",
    cues: ["Start dumbbells at ear height", "Press up and slightly in", "Lower to the start under control"],
    tags: ["Don't let the elbows flare too wide", "Keep the ribcage down"],
    coaching:
      "Each arm has to stabilize on its own here, which is why it often feels harder than the barbell version at the same weight.",
  },
  "Arnold Press": {
    muscles: ["Shoulders", "Front Delts"],
    tier: 2,
    equipment: "Dumbbell",
    tagline: "A press with a built-in rotation.",
    cues: ["Start palms facing you", "Rotate as you press overhead", "Reverse the rotation on the way down"],
    tags: ["Keep the rotation smooth, not rushed", "Don't overextend the lower back"],
    coaching:
      "The rotation adds extra time under tension through the front and side delt — control it in both directions.",
  },
  "Lateral Raise": {
    muscles: ["Side Delts"],
    tier: 3,
    equipment: "Dumbbell",
    tagline: "Width for the shoulders.",
    cues: ["Slight bend in the elbows", "Raise to shoulder height", "Lower with control"],
    tags: ["Lead with the elbows, not the hands", "Avoid swinging the torso for momentum"],
    coaching:
      "Light weight, strict form — this is one of the easiest exercises to cheat and one of the least helpful to cheat on.",
  },
  "Rear Delt Fly": {
    muscles: ["Rear Delts", "Upper Back"],
    tier: 3,
    equipment: "Dumbbell",
    tagline: "Balances out all the pressing.",
    cues: ["Hinge forward, chest toward the floor", "Raise arms out to the sides", "Squeeze the shoulder blades at the top"],
    tags: ["Keep a soft bend in the elbows", "Avoid using the lower back to heave"],
    coaching:
      "Most lifters press far more than they pull — this exercise is the tax you pay to keep the shoulders balanced.",
  },
  "Upright Row": {
    muscles: ["Side Delts", "Traps"],
    tier: 3,
    equipment: "Barbell",
    tagline: "Vertical pulling for delts and traps.",
    cues: ["Grip just inside shoulder width", "Pull elbows up and out", "Lower with control"],
    tags: ["Keep the bar close to the body", "Stop around chin height"],
    coaching:
      "Lead with the elbows and stop before shoulder height if it ever pinches — the range that hurts helps no one.",
  },
  "Face Pull": {
    muscles: ["Rear Delts", "Upper Back"],
    tier: 3,
    equipment: "Cable",
    tagline: "The shoulder health staple.",
    cues: ["Pull to the face, rope splitting apart", "Elbows finish high", "Squeeze the shoulder blades together"],
    tags: ["Keep upper arms roughly parallel to the floor", "Use lighter weight than you think"],
    coaching:
      "This one is about quality, not load — it earns its keep by keeping the rear delts and rotator cuff working.",
  },
  "Barbell Curl": {
    muscles: ["Biceps"],
    tier: 2,
    equipment: "Barbell",
    tagline: "The classic mass builder for biceps.",
    cues: ["Elbows pinned to the sides", "Curl up without swinging", "Lower all the way under control"],
    tags: ["Don't let the elbows drift forward", "Squeeze at the top"],
    coaching:
      "Any swing in the torso is momentum stolen from the biceps — keep the elbows locked in place.",
  },
  "Dumbbell Curl": {
    muscles: ["Biceps"],
    tier: 2,
    equipment: "Dumbbell",
    tagline: "Independent arms, full rotation.",
    cues: ["Start with palms facing in", "Rotate to palms-up as you curl", "Lower with control, rotating back"],
    tags: ["Keep elbows still at your sides", "Avoid using the shoulders to help"],
    coaching:
      "The rotation through the curl is what recruits the biceps fully — a straight up-and-down curl leaves work on the table.",
  },
  "Hammer Curl": {
    muscles: ["Biceps", "Forearms"],
    tier: 3,
    equipment: "Dumbbell",
    tagline: "Thickness through the outer arm.",
    cues: ["Palms face each other throughout", "Curl straight up", "Lower under control"],
    tags: ["Keep the wrist neutral, not bent", "Elbows stay at the sides"],
    coaching:
      "The neutral grip shifts emphasis onto the brachialis, which pushes the bicep peak up rather than out.",
  },
  "Preacher Curl": {
    muscles: ["Biceps"],
    tier: 3,
    equipment: "Barbell",
    tagline: "Strict curling, no cheating.",
    cues: ["Upper arms flat against the pad", "Curl to full contraction", "Lower until the arm is almost straight"],
    tags: ["Don't let the shoulders round forward", "Control the last few inches at the bottom"],
    coaching:
      "The pad removes any ability to swing — if the weight is too heavy here, it'll show immediately.",
  },
  "Tricep Pushdown": {
    muscles: ["Triceps"],
    tier: 3,
    equipment: "Cable",
    tagline: "Isolation for the back of the arm.",
    cues: ["Elbows pinned to the sides", "Extend to full lockout", "Return under control"],
    tags: ["Don't let the elbows drift forward", "Keep the torso still, no leaning"],
    coaching:
      "The elbows are the hinge point — if they start swinging, the triceps are sharing the work with the shoulders.",
  },
  "Skull Crusher": {
    muscles: ["Triceps"],
    tier: 2,
    equipment: "Barbell",
    tagline: "Heavy triceps extension, lying down.",
    cues: ["Bar starts over the chest", "Lower to just above the forehead", "Extend back to lockout"],
    tags: ["Keep the upper arms vertical", "Move only at the elbow"],
    coaching:
      "The upper arm angle should barely change — all the motion happens at the elbow, not the shoulder.",
  },
  "Close-Grip Bench Press": {
    muscles: ["Triceps", "Chest"],
    tier: 2,
    equipment: "Barbell",
    tagline: "A pressing move for arm size.",
    cues: ["Grip just inside shoulder width", "Lower to the lower chest, elbows tucked", "Press up, driving through the triceps"],
    tags: ["Keep elbows close to the body", "Don't flare out like a regular bench"],
    coaching:
      "A grip too narrow turns this into a wrist-strain exercise — just inside shoulder width is the sweet spot.",
  },
  Plank: {
    muscles: ["Core"],
    tier: 3,
    equipment: "Bodyweight",
    tagline: "Anti-movement, held.",
    cues: ["Elbows under shoulders", "Squeeze glutes and brace the abs", "Hold a straight line head to heels"],
    tags: ["Don't let the hips sag or pike", "Breathe — don't hold your breath"],
    coaching:
      "A plank isn't about duration, it's about tension — a strict 20 seconds beats a sagging 60.",
  },
  "Hanging Leg Raise": {
    muscles: ["Core", "Hip Flexors"],
    tier: 2,
    equipment: "Bodyweight",
    tagline: "Loaded core flexion from a hang.",
    cues: ["Hang with a slight lean back", "Curl the hips up toward the ribs", "Lower with control, no swinging"],
    tags: ["Lead with the hips, not just the legs", "Avoid using momentum to swing up"],
    coaching:
      "The lift comes from curling the pelvis, not just lifting the legs — that's what actually loads the abs.",
  },
  "Cable Crunch": {
    muscles: ["Core"],
    tier: 3,
    equipment: "Cable",
    tagline: "Loaded spinal flexion.",
    cues: ["Kneel below the pulley, rope behind the head", "Crunch down, rounding the spine", "Return under control"],
    tags: ["Move at the waist, not the hips", "Keep hips stacked over the knees"],
    coaching:
      "Hinge from the spine, not the hips — if the hips are moving, it's turning into a hip-flexor exercise.",
  },
  "Ab Wheel Rollout": {
    muscles: ["Core"],
    tier: 2,
    equipment: "Ab Wheel",
    tagline: "Anti-extension under load.",
    cues: ["Start kneeling, wheel under the shoulders", "Roll out only as far as the core can control", "Pull back in, leading with the abs"],
    tags: ["Keep the lower back from arching", "Stop before you feel the back take over"],
    coaching:
      "The moment the lower back arches is the moment the rep should end — range comes second to control here.",
  },
  "Russian Twist": {
    muscles: ["Core", "Obliques"],
    tier: 3,
    equipment: "Bodyweight",
    tagline: "Rotational core strength.",
    cues: ["Lean back to ~45°, feet lifted or grounded", "Rotate the torso side to side", "Keep the movement controlled, not flung"],
    tags: ["Rotate from the ribs, not just the arms", "Keep the chest lifted throughout"],
    coaching:
      "Speed doesn't add difficulty here — slowing down and controlling the rotation does.",
  },
};

const GENERIC: ExerciseInfo = {
  muscles: ["Full Body"],
  tier: 2,
  equipment: "Various",
  tagline: "Your own addition to the library.",
  cues: ["Warm up before adding load", "Move through a full, controlled range", "Stop the set a rep or two before failure"],
  tags: ["Log the same rep range each session", "Progress the weight slowly"],
  coaching:
    "No form notes yet for this one — track your own cues here as you learn how it feels for you.",
};

export function getExerciseInfo(name: string): ExerciseInfo {
  return INFO[name] ?? GENERIC;
}
