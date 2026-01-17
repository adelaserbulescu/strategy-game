package com.strategygameapp.repository;

import com.strategygameapp.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionRepository extends JpaRepository<Action, Long> {
}
