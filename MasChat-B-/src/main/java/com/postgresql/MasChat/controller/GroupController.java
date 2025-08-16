package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.GroupDTO;
import com.postgresql.MasChat.dto.GroupMemberDTO;
import com.postgresql.MasChat.model.GroupMember;
import com.postgresql.MasChat.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupDTO>> getMyGroups(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            List<GroupDTO> groups = groupService.getUserGroups(userId);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<GroupDTO>> getPublicGroups() {
        try {
            List<GroupDTO> groups = groupService.getPublicGroups();
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<GroupDTO>> searchGroups(@RequestParam String query) {
        try {
            List<GroupDTO> groups = groupService.searchGroups(query);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupDTO groupDTO, Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            GroupDTO createdGroup = groupService.createGroup(groupDTO, userId);
            return ResponseEntity.ok(createdGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<String> joinGroup(@PathVariable Long groupId, Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            boolean success = groupService.joinGroup(groupId, userId);
            if (success) {
                return ResponseEntity.ok("Successfully joined the group");
            } else {
                return ResponseEntity.badRequest().body("Failed to join group");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId, Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            boolean success = groupService.leaveGroup(groupId, userId);
            if (success) {
                return ResponseEntity.ok("Successfully left the group");
            } else {
                return ResponseEntity.badRequest().body("Failed to leave group");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDTO> getGroupById(@PathVariable Long groupId) {
        try {
            GroupDTO group = groupService.getGroupById(groupId);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(@PathVariable Long groupId) {
        try {
            List<GroupMemberDTO> members = groupService.getGroupMembers(groupId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{groupId}/members/{memberId}/role")
    public ResponseEntity<String> updateMemberRole(
            @PathVariable Long groupId,
            @PathVariable Long memberId,
            @RequestParam String role,
            Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            GroupMember.GroupRole newRole = GroupMember.GroupRole.valueOf(role.toUpperCase());
            boolean success = groupService.updateGroupRole(groupId, userId, memberId, newRole);
            if (success) {
                return ResponseEntity.ok("Role updated successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to update role");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{groupId}/is-member")
    public ResponseEntity<Boolean> isUserMember(@PathVariable Long groupId, Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            boolean isMember = groupService.isUserMember(groupId, userId);
            return ResponseEntity.ok(isMember);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{groupId}/is-admin")
    public ResponseEntity<Boolean> isUserAdmin(@PathVariable Long groupId, Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            boolean isAdmin = groupService.isUserAdmin(groupId, userId);
            return ResponseEntity.ok(isAdmin);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 