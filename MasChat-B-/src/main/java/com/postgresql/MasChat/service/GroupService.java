package com.postgresql.MasChat.service;

import com.postgresql.MasChat.dto.GroupDTO;
import com.postgresql.MasChat.dto.GroupMemberDTO;
import com.postgresql.MasChat.model.Group;
import com.postgresql.MasChat.model.GroupMember;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.GroupRepository;
import com.postgresql.MasChat.repository.GroupMemberRepository;
import com.postgresql.MasChat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    public List<GroupDTO> getUserGroups(Long userId) {
        List<Group> groups = groupRepository.findByMemberId(userId);
        return groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GroupDTO> getPublicGroups() {
        List<Group> groups = groupRepository.findPublicGroups();
        return groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GroupDTO> searchGroups(String searchTerm) {
        List<Group> groups = groupRepository.searchGroups(searchTerm);
        return groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GroupDTO createGroup(GroupDTO groupDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = new Group();
        group.setName(groupDTO.getName());
        group.setDescription(groupDTO.getDescription());
        group.setPrivate(groupDTO.isPrivate());
        group.setCategory(groupDTO.getCategory());
        group.setImageUrl(groupDTO.getImageUrl());
        group.setCreatedBy(user);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());

        Group savedGroup = groupRepository.save(group);

        // Add creator as admin
        GroupMember adminMember = new GroupMember();
        adminMember.setGroup(savedGroup);
        adminMember.setUser(user);
        adminMember.setRole(GroupMember.GroupRole.ADMIN);
        adminMember.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(adminMember);

        return convertToDTO(savedGroup);
    }

    public boolean joinGroup(Long groupId, Long userId) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (!groupOpt.isPresent()) {
            return false;
        }

        Group group = groupOpt.get();
        if (group.isPrivate()) {
            return false; // Private groups require invitation
        }

        // Check if user is already a member
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (existingMember.isPresent()) {
            return false;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setRole(GroupMember.GroupRole.MEMBER);
        member.setJoinedAt(LocalDateTime.now());

        groupMemberRepository.save(member);
        return true;
    }

    public boolean leaveGroup(Long groupId, Long userId) {
        Optional<GroupMember> memberOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (!memberOpt.isPresent()) {
            return false;
        }

        GroupMember member = memberOpt.get();
        if (member.getRole() == GroupMember.GroupRole.ADMIN) {
            // Check if there are other admins
            List<GroupMember> admins = groupMemberRepository.findAdminsByGroupId(groupId);
            if (admins.size() <= 1) {
                return false; // Cannot leave if you're the only admin
            }
        }

        groupMemberRepository.delete(member);
        return true;
    }

    public boolean updateGroupRole(Long groupId, Long userId, Long targetUserId, GroupMember.GroupRole newRole) {
        // Check if user has permission to change roles
        Optional<GroupMember> userMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (!userMember.isPresent() || userMember.get().getRole() != GroupMember.GroupRole.ADMIN) {
            return false;
        }

        Optional<GroupMember> targetMember = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId);
        if (!targetMember.isPresent()) {
            return false;
        }

        GroupMember member = targetMember.get();
        member.setRole(newRole);
        groupMemberRepository.save(member);
        return true;
    }

    public List<GroupMemberDTO> getGroupMembers(Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        return members.stream()
                .map(this::convertMemberToDTO)
                .collect(Collectors.toList());
    }

    public GroupDTO getGroupById(Long groupId) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (!groupOpt.isPresent()) {
            throw new RuntimeException("Group not found");
        }
        return convertToDTO(groupOpt.get());
    }

    public boolean isUserMember(Long groupId, Long userId) {
        Optional<GroupMember> member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        return member.isPresent();
    }

    public boolean isUserAdmin(Long groupId, Long userId) {
        Optional<GroupMember> member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        return member.isPresent() && member.get().getRole() == GroupMember.GroupRole.ADMIN;
    }

    private GroupDTO convertToDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setPrivate(group.isPrivate());
        dto.setCategory(group.getCategory());
        dto.setImageUrl(group.getImageUrl());
        dto.setCreatedBy(group.getCreatedBy().getId());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setActive(group.isActive());
        
        // Get member count
        Long memberCount = groupMemberRepository.countByGroupId(group.getId());
        dto.setMemberCount(memberCount);
        
        return dto;
    }

    private GroupMemberDTO convertMemberToDTO(GroupMember member) {
        GroupMemberDTO dto = new GroupMemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUserName(member.getUser().getFullName());
        dto.setUserAvatar(member.getUser().getProfilePicture());
        dto.setRole(member.getRole().toString());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setActive(member.isActive());
        return dto;
    }
} 