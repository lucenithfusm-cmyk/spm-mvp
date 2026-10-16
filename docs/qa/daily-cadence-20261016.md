# Daily cadence and seven recovery stories

User review found that the four pelvic Lab entries (6/12/19/24; fewer for EP) did not provide two sessions per week, and that only two recovery stories were assigned. EP's existing 12-session schedule already provides three sessions per week and is unchanged.

## Changes

- EF and EP: pelvic Lab on 2, 6, 9, 13, 16, 20, 23, 27. EF day 6 opens the real Lab as its primary activity; each day has only one pelvic entry. Supports remain conditional/optional and preserve the Lab's screening, relaxation and safety adaptations.
- EP: sessions remain 1/3/5, 8/10/12, 15/17/19, 22/24/26, with no pelvic Lab on those days.
- All six routes: seven different recovery stories on 4, 8, 11, 15, 18, 22, 25, ordered for the route. Cards display the actual story title and number. Daily recovery opens the matching existing avatar narrative; Library retains all seven stories.
- Recovery records include scenario identity so a previously saved different story does not automatically complete the new assignment.
- Wellness remains daily, video/breathing/focalization calendars and D14/D28 checkpoints remain in place. At most five cards appear in combined profiles, including optional wellness.

## Verification

Unit coverage asserts every route's seven unique real scenario IDs, weekly frequency/alternation, saved scenario identity, and unchanged safety restrictions. Browser coverage opens all 42 route-story combinations and verifies their avatar narratives, checks all 168 days and ensures browsing does not write records.

Local Chromium cannot launch under this execution environment's socket policy; browser validation runs through the existing GitHub QA workflow. This update is limited to draft PR 26 and preview; production is unchanged.
